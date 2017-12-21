/**
 * Created by Andy Likuski on 2017.09.04
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from 'react';
import * as R from 'ramda';
import {v} from 'rescape-validate';
import PropTypes from 'prop-types';
import {filterWithKeys, mapKeys, mergeDeep, throwing} from 'rescape-ramda';
import * as Either from 'data.either';
import {getClassAndStyle, getStyleObj} from 'helpers/styleHelpers';
import prettyFormat from 'pretty-format';
import {graphql} from 'graphql';
import {createSelectorResolvedSchema} from 'schema/selectorResolvers';
import {sampleConfig} from 'data/samples/sampleConfig';
import makeSchema from 'schema/schema';
import {createSelectorCreator, defaultMemoize} from 'reselect';


const {reqPath} = throwing;

/**
 * Returns true if the lens applied to props equals the lens applied to nextProps
 * @param {Function} lens Ramda lens
 * @param {Object|Array} props React props
 * @param {Object|Array} nextProps Reach nextProps
 * @returns {Boolean} True if equal, else false
 */
export const propLensEqual = v(R.curry((lens, props, nextProps) =>
    R.equals(
      R.view(lens, props),
      R.view(lens, nextProps)
    )
  ),
  [
    ['lens', PropTypes.func.isRequired],
    ['props', PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired],
    ['nextProps', PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired]
  ], 'propLensEqual');


/**
 * Maps each Reach element to an curried e function.
 * @param {[String|Element]} types React element types (e.g. ['div', 'svg', React])
 * @returns {Function} A list of functions that need just the config and children specified, not the type
 */
export const eMap = types => R.map(component => React.createFactory(component), types);

/**
 * Returns a function that expects props containing one of data.loading|error|store
 * If error is defined it calls onError. If loading is true it calls onLoading. If store it calls onData
 * Otherwise an exception is thrown
 * @param onError. Function expecting data and called if data.error is not null
 * @param onLoading Function expecting data and called if data.loading is true
 * @param onData Function expecting data and called if onError and onLoading are not called
 * @param props An Object that must have one of data.error|.loading|.store
 * @return {*} The result of the onError, onLoading, onData, or an Exception if none are matched
 */
export const errorOrLoadingOrData = R.curry((onError, onLoading, onData, props) =>
  R.cond([
    [R.view(R.lensPath(['data', 'error'])), onError],
    [R.view(R.lensPath(['data', 'loading'])), onLoading],
    [R.view(R.lensPath(['data', 'store'])), onData],
    [R.T, props => {
      throw new Error(`No error, loading, nor store prop: ${prettyFormat(props)}`);
    }]
  ])(props)
);

/**
 * Copies any needed actions to view containers
 * Also removes ownProps from the return value since we already incorporated theses into stateProps
 * @props {Object} viewToActions An object keyed by view that is in stateProps.views and valued by
 * an array of action names
 * @returns {Function} A mergeProps function that expects props (e.g. A merge stateProps and dispatchProps)
 */
export const mergeActionsForViews = (viewToActionNames) => (props) => {
  return R.over(
    R.lensProp('views'),
    views =>
      mergeDeep(
        // Merge any existing values in props.views
        views,
        // Map each propPath to the value in props or undefined
        // This transforms {viewName: {propName: 'pathInPropsToPropName (e.g. store.propName)', ...}
        // This results in {viewName: {propName: propValue, ...}
        R.map(
          actionNames =>
            R.fromPairs(R.map(
              // Create a pair [actionName, action func]
              actionName => [actionName, R.view(R.lensProp(actionName), props)],
              // Within each view, map each actinoName
              actionNames)),
          // Map each view
          viewToActionNames
        )
      ),
    props
  );
};

/**
 * Given a mapping from view names to an array of prop paths,
 * and given actual prop values,
 * adds or merges a views property into the props, where views is an object keyed by
 * the same keys as viewToPropPaths and valued by the resolution of the viewToPropPaths props strings.
 * This allows a Container or Component to efficiently specify which props to give the view
 * used by each sub component
 * Example, if aComponent and bComponents are two child components that need the following props:
 * const viewToProps = {aComponent: ['foo', 'store.bar'], bComponent: ['store.bar', 'zwar']}
 * and props are
 * const props = {
      a: 1,
      views: {aComponent: {stuff: 1}, bComponent: {moreStuff: 2}},
      data: {
        foo: 1,
        zwar: 3
        store: {
          bar: 2
        }
      }
    };
 * The function returns
 * {
    a: 1,
    views: {
      aComponent: {stuff: 1, foo: 1, bar: 2},
      bComponent: {moreStuff: 2, bar: 2, zwar: 3}
    },
    foo: 1,
    bar: 2,
    zwar: 3
  }
 *
 * @param {Object} viewsToPropPaths As described above. Note that the paths are always relative to props.data
 * @param {Object} props
 * @param {Object} props.data Must be present to search for propPaths
 * @props {Object} props with props added to props.views
 */
export const mergePropsForViews = R.curry((viewToPropPaths, props) => {
  return R.over(
    R.lensProp('views'),
    views =>
      mergeDeep(
        // Merge any existing values in props.views
        views,
        // Map each propPath to the value in props or undefined
        // This transforms {viewName: {propName: 'pathInPropsToPropName (e.g. store.propName)', ...}
        // This results in {viewName: {propName: propValue, ...}
        R.map(
          propNameToPropPath =>
            R.map(
              propPath => R.view(R.lensPath(R.split('.', propPath)), reqPath(['data'], props)),
              // Within each view, map each propNameToPropPath
              propNameToPropPath),
          // Map each view
          viewToPropPaths
        )
      ),
    props
  );
});

/**
 * Merges the results of an Apollo query (or the loading or error state) with ownProps
 * and then calls mergePropsForViews
 * @props {Object} viewToProps See mergePropsForViews
 * @props {Object} data The Apollo data object that results from a query
 * @props {Object} ownProps Props that Apollo passes through from wrapping container
 * (in our case this is the result of mapStateToProps)
 * @returns {Either} An Either as described above
 */
export const resolveViewProps = R.curry((viewsToPropNames, {data, ownProps}) =>
  // For the error and loading cases, give the views only what's in ownProps, since data isn't loaded
  // ownProps might have legitimate props that can be show in a loading or error state
  mergePropsForViews(
    viewsToPropNames,
    mergeDeep(
      ownProps,
      {data}
    )
  )
);

/**
 * Given a container's mapStateToProps and mapDispatchToProps, returns a function that accepts a sample state
 * and sample ownProps. This function may be exported by a container to help with unit tests
 * @param {Function} mapStateToProps The mapStatesToProps function of a container. It will be passed
 * sampleState and sampleOwnProps when invoked
 * @param {Function} mapDispatchToProps The mapDispatchToProps function of a container. It will be passed
 * the identity function for a fake dispatch and sampleOwnProps when invoked
 * @returns {Function} A function that expects a sample state and sample ownProps and returns a complete
 * sample props according to the functions of the container
 */
export const makeTestPropsFunction = (mapStateToProps, mapDispatchToProps) =>
  (sampleState, sampleOwnProps) => R.merge(
    mapStateToProps(sampleState, sampleOwnProps),
    mapDispatchToProps(R.identity)
  );

/**
 * Like makeTestPropsFunction, but additionally resolves an Apollo query to supply complete data for a test
 * @param {Function} mapStateToProps
 * @param {Function} mapDispatchToProps
 * @param {Function} mergeProps
 * @query {String} query Contains an apollo query string (not gql string)
 * @args {Function} args Contains an apollo query args in the format
 * {
 *  options: { variables: { query args } }
 * }
 *
 * @return {function({query?: *, args?: *})} query is an Apollo query string and args is a function that
 * expects props and produces query args with their values inside a key 'variables'. This matches the
 * Apollo React client setup. Example
 * args = props => {
 *  variables: {
 *    regionId: props.region.id
 *  }
 *  }
 *  The function returns a Promise that passes an Either.Left or Right. If Left there ar errors in the Either.value. If
 *  Right then the value is the store
 */
export const makeApolloTestPropsFunction = R.curry((mapStateToProps, mapDispatchToProps, {query, args}) => {
  const resolvedSchema = createSelectorResolvedSchema(makeSchema(), sampleConfig);

  return R.composeP(
    props => graphql(
      resolvedSchema,
      query, {},
      { options: {dataSource: sampleConfig} },
      // Add data and ownProps since that is what Apollo query arguments props functions expect
      reqPath(['variables'], args.options(props))
    ).then(
      // Merge the makeTestPropsFunction props with the Apollo result. Put Apollo under the data.store key
      // just like our Apollo React Client does by default
      ({data, errors}) => {
        if (errors)
          return Either.Left(errors);
        return Either.Right(
          mergeDeep(
            props,
            {data}
          )
        );
      }
    ).catch(e => {
      return Either.Left([e]);
    }),
    // Creates Redux function props
    (...args) => Promise.resolve(makeTestPropsFunction(mapStateToProps, mapDispatchToProps)(...args))
  );
});

/**
 * Wraps a function that expects states and props and returns sample props with a function that
 * runs a graphql query
 * @param resolvedSchema
 * @param dataSource
 * @param queryArgs
 */
/*
export const makeGraphQlTestPropsFunction = (resolvedSchema, dataSource, queryArgs) => async (state, props) => {
  const result = await graphql(resolvedSchema, queryArgs.query, {}, {options: {dataSource}}).then(result =>
    queryArgs.args.props

  (sampleState, sampleOwnProps) =>
    mergeProps(
      mapStateToProps(sampleState, sampleOwnProps),
      mapDispatchToProps(R.identity), sampleOwnProps
    );
}
*/

/**
 * Given a React component function that expects props and given props that are a functor (Array or Object),
 * lift the component to handle all values of the functor and then extract the values
 * @param {Function} component A React component function that expects props
 * @param {Functor} props An array or object (or any other functor for which we can extract the values
 * Each value contains the props to create on component using the component function. The results are
 * returned as an array of components
 * @return {[Object]} A list of React components
 */
export const liftAndExtract = (component, props) => {
  return R.values(
    // Note that R.map(component, props) would work here too,
    // but this might refactor better if we support passing child components
    R.liftN(1, component)(props)
  );
};

/**
 * Like liftAndExtract but expects propsWithItems to have an items key holding the functor
 * This is useful to separate dispatch actions from the props functor, since dispatch
 * actions are always the same for all items
 * @param {Function} component A React component function that expects props
 * @param {Object} propsWithItems Has a key items that holds an array or object
 * (or any other functor for which we can extract the values
 * @return {[Object]} A list of React components
 */
export const liftAndExtractItems = (component, propsWithItems) => {
  return liftAndExtract(component, reqPath(['items'], propsWithItems));
};

/**
 * Given a getStyles function that expects props and returns styles keyed by view, merges those
 * view values into the views of the props.
 * @param {Function|Object} viewStyles Either an object mapping of view names to styles, or a function that expects
 * props and returns that object. viewStyles often merge props or apply them to functions.
 * @param props
 * @return {*}
 */
export const mergeStylesIntoViews = R.curry((viewStyles, props) => {
  // Map each {view: styles} to {view: {style: styles}}
  const viewToStyle = R.map(
    style => ({style}),
    R.ifElse(R.is(Function), f => f(props), R.identity)(viewStyles)
  );
  // Deep props.views with viewStyles and return entire props
  return R.over(
    R.lensProp('views'),
    views => mergeDeep(views, viewToStyle),
    props
  );
});

/**
 * Given viewProps keyed by by view names, find the one that matches name.
 * Then create the class and style props from the name and style props and merge it with the other props
 * If no matches props are found, {className: decamelized name} is returned
 * Example: name = 'fooOuterDiv'
 * viewProps: {
 *  fooOuterDiv: {
 *    bar: 1,
 *    style: {
 *      color: 'red'
 *    }
 *  }
 * }
 * resolves to {
 *  bar: 1,
 *  className: 'foo-outer-div'
 *  style: {
 *    color: 'red'
 *  }
 * }
 *
 * @param name
 * @param viewProps
 * @return {*}
 */
export const propsFor = (name, viewProps) => {
  const propsForView = R.defaultTo({}, R.view(R.lensProp(name), viewProps));
  return R.merge(
    propsForView,
    getClassAndStyle(
      name,
      viewProps
    )
  );
};

export const propsAndStyle = (name, viewProps) => R.merge(
  getStyleObj(name, R.propOr({name: {style: {}}}, name, viewProps)),
  R.omit(['style'], viewProps)
);

/**
 * Creates {name1: name1, name2: name2} from a list of names
 * @param {Array} names A list of names to be constants
 */
export const nameLookup = nameObj =>
  R.mapObjIndexed(
    (v, k) => k,
    nameObj
  );

/**
 * Convenience method to call mergeActionsForView, mergePropsForView, and mergeStylesIntoViews
 * @param {Object} viewActions Argument to mergeActionsForView. See mergeActionsForViews
 * @param {Object} viewProps Argument to mergePropsForViews. See mergePropsForViews
 * @param {Object|Function} getStyles Argument to mergeStylesIntoViews. See mergeStylesIntoViews
 * @param {Object} props Props that are used for the composition. Each of the three functions
 * is called with the props. There should be no dependencies between the three functions--they
 * each contribute to the returned props.views
 * @return {Function} The modified props with view properties added by each of the three functions
 */
export const composeViews = R.curry((viewActions, viewProps, getStyles, props) => R.compose(
  mergeActionsForViews(viewActions),
  mergePropsForViews(viewProps),
  mergeStylesIntoViews(getStyles)
  )(props)
);


