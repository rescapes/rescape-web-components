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
import {filterWithKeys, mergeDeep, throwing} from 'rescape-ramda';
import graphql from 'graphql';
import * as Either from 'data.either';

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
 * Returns a function that expects a data structure containing a loading true/false flag and an optional error flag
 * If error is defined it calls onError. If loading is true it calls onLoading. Otherwise it calls
 * onData, assuming that the result data is somewhere in the given data
 * @param onError. Function expecting data and called if data.error is not null
 * @param onLoading Function expecting data and called if data.loading is true
 * @param onData Function expecting data and called if onError and onLoading are not called
 * @return {*} A function expecting a data structure
 */
export const errorOrLoadingOrData = (onError, onLoading, onData) =>
  R.cond([
    [R.prop('error'), onError],
    [R.prop('loading'), onLoading],
    [R.T, onData]
  ]);

/**
 * Copies any needed actions to view containers
 * Also removes ownProps from the return value since we already incorporated theses into stateProps
 * @props {Object} viewToActions An object keyed by view that is in stateProps.views and valued by
 * an array of action names
 * @returns {Function} A mergeProps function that expects stateProps and dispatchProps (The standard
 * third argument ownProps is never used, since it is assumed to have been merged into stateProps)
 */
export const mergeActionsForViews = (viewToActionNames) => (stateProps, dispatchProps) => {
  const props = R.merge(stateProps, dispatchProps);
  return R.over(
    R.lensProp('views'),
    views =>
      R.mapObjIndexed(
        // For each view in props.views
        (viewActions, viewName) => R.compose(
          // Then merge with the existing props in the view
          R.merge(viewActions),
          // Map the values of the props listed in the corresponding viewToPropNames
          R.pick(R.propOr([], viewName, viewToActionNames))
        )(props),
        (R.defaultTo({}, views))
      ),
    props
  );
};

/**
 * Given a mapping from view names to an array of prop names and actual prop values,
 * Adds or merges a views property into the props, where views is an object keyed by
 * the same keys as viewToProps and valued by the resolution of the viewToProps props strings.
 * This allows a Container or Component to efficiently specify which props to give the view
 * used by each sub component
 * Example, if aComponent and bComponents are two child components that need the following props:
 * const viewToProps = {aComponent: ['foo', 'bar'], bComponent: ['bar', 'zwar']}
 * and props are
 * const props = {
      a: 1,
      views: {aComponent: {stuff: 1}, bComponent: {moreStuff: 2}},
      foo: 1,
      bar: 2,
      zwar: 3
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
 */
export const mergePropsForViews = R.curry((viewToPropNames, props) => {
  return R.over(
    R.lensProp('views'),
    views =>
      R.mapObjIndexed(
        // For each view in props.views
        (viewProps, viewName) => R.compose(
          // Then merge with the existing props in the view
          R.merge(viewProps),
          // Map the values of the props listed in the corresponding viewToPropNames
          R.pick(R.propOr([], viewName, viewToPropNames))
        )(props),
        (R.defaultTo({}, views))
      ),
    props
  );
});

/**
 * Merges the results of an Apollo query (or the loading or error state) with ownProps, and then
 * returns an Either.Left if an error is detected or and Either.Right if loading is detected.
 * Both of these are called with the Apollo data object. If neither loading, nor error, meaning
 * the data is ready, and Either.Right is called with mergePropsForViews(viewsToProps, data)
 * @props {Object} viewToProps See mergePropsForViews
 * @props {Object} data The Apollo data object that results from a query
 * @props {Object} ownProps Props that Apollo passes through from wrapping container
 * (in our case this is the result of mapStateToProps)
 * @returns {Either} An Either as described above
 */
export const resolveApolloProps = R.curry((viewsToPropNames, {data, ownProps}) =>
  errorOrLoadingOrData(
    R.identity,
    R.identity,
    mergePropsForViews(viewsToPropNames)
  )(
    mergeDeep(
      ownProps,
      // Merge data.store with data if store is defined
      R.merge(R.omit(['store'], data), R.view(R.lensProp(['store']), data))
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
 * @param {Function} [mergeProps] Optional mergeProps function. Defaults to R.merge to merge the result
 * of mapStateToProps and mapDispatchToProps results
 * @returns {Function} A function that expects a sample state and sample ownProps and returns a complete
 * sample props according to the functions of the container
 */
export const makeTestPropsFunction = (mapStateToProps, mapDispatchToProps, mergeProps = R.merge) =>
  (sampleState, sampleOwnProps) =>
    mergeProps(
      mapStateToProps(sampleState, sampleOwnProps),
      mapDispatchToProps(R.identity), sampleOwnProps
    );

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
 * view values into the views of the props
 * @param getStyles
 * @param props
 * @return {*}
 */
export const mergeStylesIntoViews = (getStyles, props) => {
  const viewStyles = R.map(
    style => ({style}),
    getStyles(reqPath(['data', 'style'], props))
  );
  // Replace props.data.style with computed styles
  return R.over(
    R.lensProp('views'),
    views => mergeDeep(views, viewStyles),
    props
  );
}
