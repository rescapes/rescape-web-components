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
import {compact} from 'enzyme-to-json';


const {reqPath} = throwing;

/**
 * Default statuses for Components that don't have any Apollo queries
 * @type {{loading: boolean, error: boolean}}
 */
export const loadingCompleteStatus = {
  loading: false,
  error: false,
  store: {}
};

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
 * Given a mapping from view names to an array of prop values or functions,
 * adds or merges a views property into the props, where views is an object keyed by
 * the same keys as viewToPropValuesOrFuncs and valued by the resolution of the viewToPropValuesOrFuncs
 * This allows a Container or Component to efficiently specify which props to give the view
 * used by each sub component. Each props of viewToPropValuesOrFuncs can be a constant value or
 * a unary function that is passed props and resolves the valuej
 * Example, if aComponent and bComponents are two child components that need the following props:
 * const viewToProps = {
 *  aComponent: {
 *    foo: 1, bar: R.lensPath(['store, 'bar'])
 * },
 * bComponent: {
 *    // These are two functions that resolve paths in different ways
 *    bar: R.lensPath(['store', 'bar'], width: (props) => props.style.width
 * }
 * and props are
 * const props = {
      a: 1,
      views: {aComponent: {stuff: 1}, bComponent: {moreStuff: 2}},
      data: {
        foo: 1,
        store: {
          bar: 2
        }
      }
      style: {
        width: '100px'
      }
    };
 * The function returns
 * {
    a: 1,
    views: {
      aComponent: {stuff: 1, foo: 1, bar: 2},
      bComponent: {moreStuff: 2, bar: 2, width: '100px'}
    },
    foo: 1,
    bar: 2,
  }
 *
 * @param {Function|Object} viewsToPropValuesOrFuncs If an object then as described above.
 * If a funciton it expects props and returns the object as described above. A function is
 * useful for generating multiple key/values
 * @param {Object} props
 * @param {Object} props.data Must be present to search for propPaths
 * @props {Object} props with props added to props.views
 */
export const mergePropsForViews = R.curry((viewToPropValuesOrFuncs, props) => {
  return R.over(
    R.lensProp('views'),
    views => mergeDeep(
      // Merge any existing values in props.views
      views,
      // Map each propPath to the value in props or undefined
      // This transforms {viewName: {propName: 'pathInPropsToPropName (e.g. store.propName)', ...}
      // This results in {viewName: {propName: propValue, ...}
      R.map(
        propNameToValueOrFunc => R.map(
          // IfElse on propPath
          R.ifElse(
            R.is(Function),
            // if it is function, call with props and expect a value back
            f => f(props),
            // otherwise assume it's already a resolved value
            R.identity
          ),
          // Within each view, map each propNameToPropPath
          propNameToValueOrFunc
        ),
        // If the entire viewToPropValuesOrFuncs is a function pass props to it
        R.ifElse(
          R.is(Function),
          f => f(props),
          R.identity)(viewToPropValuesOrFuncs)
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
      {options: {dataSource: sampleConfig}},
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
            {
              data: R.merge(
                // Simulate loading complete
                loadingCompleteStatus,
                data
              )
            }
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
  // viewStyles can be an object or unary function that returns an object
  const viewObjs = R.ifElse(R.is(Function), f => f(props), R.identity)(viewStyles);

  // if the viewObj has style as a key, we take that to mean that the object is in the
  // shape {style: {...}, className: 'extra class names'}. Otherwise it means
  // that it is just style props because no extra className was needed
  const viewToStyle = R.map(
    viewObj => R.ifElse(
      R.has('style'),
      // Done
      R.identity,
      // Wrap it in a style key
      style => ({style})
    )(viewObj),
    viewObjs);

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
 * @param views
 * @return {*}
 */
export const propsFor = (name, views) => {
  const propsForView = R.defaultTo({}, R.view(R.lensProp(name), views));
  return R.merge(
    propsForView,
    getClassAndStyle(
      name,
      views
    )
  );
};

/**
 * Like propsFor but doesn't generate a className since non-trivial components ignore it
 * @param name
 * @param views
 * @return {*}
 */
export const propsForSansClass = (name, views) => {
  const propsForView = R.defaultTo({}, R.view(R.lensProp(name), views));
  return R.merge(
    propsForView,
    getStyleObj(name, views)
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
 * is called with the props.
 * Styles is computed first in case viewProps need to access a computed style value, namely with and height.
 * Otherwise There should be no dependencies between the three functions--they
 * each contribute to the returned props.views
 * @return {Function} The modified props with view properties added by each of the three functions
 */
export const composeViews = R.curry((viewActions, viewProps, getStyles, props) => R.compose(
  mergeActionsForViews(viewActions),
  mergePropsForViews(viewProps),
  mergeStylesIntoViews(getStyles)
  )(props)
);


/**
 * Joins React components with a separatorComponent between each
 * @param {Function} separatorComponent Unary function that expects a key to index the component in the list
 * (using the React key property)
 * @param {[Function]} components List of unary functions returning a component. The function also expects key
 * to index the component in the list
 * @returns {Array} The components interspersed with separatorComponents
 */
export const joinComponents = (separatorComponent, components) =>
  R.addIndex(R.reduce)(
    (prevComponents, component, key) => R.ifElse(
      R.isNil,
      // Just component
      () => [component(key*2)],
      // Add separator and component to previous
      R.flip(R.concat)([
        separatorComponent(key*2-1),
        component(key*2)
      ])
    )(prevComponents),
    null,
    components
  );

/**
 * Expects a prop path and returns a function expecting props,
 * which resolves the prop indicated by the string. Throws if there is no match
 * @param {String} str dot-separated prop path
 * @param {Object} props Object to resolve the path in
 * @return {function(*=)}
 */
export const reqStrPath = R.curry((str, props) => reqPath(R.split('.', str), props))
/**
 * Expects a prop path and returns a function expecting props,
 * which resolves the prop indicated by the string. If not match is found it returns undefined
 * @param {String} str dot-separated prop path
 * @param {Object} props Object to resolve the path in
 * @return {function(*=)}
 */
export const strPath = R.curry((str, props) => {
  return R.view(R.lensPath(R.split('.', str)), props)
})
