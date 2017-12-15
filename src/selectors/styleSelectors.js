/**
 * Created by Andy Likuski on 2017.12.02
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {createSelector} from 'reselect';
import {throwing} from 'rescape-ramda'
import * as R from 'ramda';
const {reqPath} = throwing;

/**
 * Extracts the browser window dimensions from the state to pass to props
 * that resize based on the browser
 */
export const browserDimensionsSelector = createSelector(
  [
    R.compose(
      R.pick(['width', 'height']),
      reqPath(['browser'])
    )
  ],
  R.identity
);

/** *
 * Creates a selector that resolves the browser width and height from the state and multiplies each by the fraction
 * stored in the local props (which can either come from parent or from the component's style). If props
 * width or height is not defined they default to 1
 * @props {Object} state Expected to have a browser.[width and height]
 * @props {Object} props Expected to have a style.[width and height]
 * @returns {Object} a width and height relative to thte browser.
 */
export const makeBrowserProportionalDimensionsSelector = () => (state, props) => createSelector(
  [browserDimensionsSelector],
  dimensions => ({
    width: R.multiply(R.pathOr(1, ['style', 'width'], props), R.prop('width', dimensions)),
    height: R.multiply(R.pathOr(1, ['style', 'height'], props), R.prop('height', dimensions))
  })
)(state, props);

const defaultStyleSelector = (state, props) => reqPath(['styles', 'default'], state);

const mergeDeepWith = R.curry((fn, left, right) => R.mergeWith((l, r) => {
  // If either (hopefully both) items are arrays or not both objects
  // accept the right value
  return ((l && l.concat && R.is(Array, l)) || (r && r.concat && R.is(Array, r))) || !(R.is(Object, l) && R.is(Object, r)) ?
    fn(l, r) :
    mergeDeepWith(fn, l, r); // tail recursive
})(left, right));

/**
 * Merges two style objects, where the second can have functions to apply the values of the first.
 * If matching key values are both primitives, the style value trumps
 * @param {Object} parentStyle Simple object of styles
 * @param {Object} style Styles including functions to transform the corresponding key of parentStyle
 */
const mergeStyles = (parentStyle, style) => mergeDeepWith(
  (stateStyleValue, propStyleValue) =>
    // If keys match, the propStyleValue trumps unless it is a function, in which case the stateStyleValue
    // is passed to the propStyleValue function
    R.when(
      R.is(Function),
      x => R.compose(x)(stateStyleValue)
    )(propStyleValue),
  parentStyle,
  style
);

/**
 * Returns a function that creates a selector to
 * merge the defaultStyles in the state with the style object of the given props
 * @param {Object} state The Redux state
 * @param {Object} state.styles.default The default styles. These should be simple values
 * @param {Object} [props] Optional The props
 * @param {Object} [props.style] Optional The style object with simple values or
 * unary functions to transform the values from the state (e.g. { margin: 2, color: 'red', border: scale(2) })
 * where scale(2) returns a function that transforms the border property from the state
 * @returns {Object} The merged object
 */
export const makeMergeDefaultStyleWithProps = () => (state, props) => createSelector(
  [defaultStyleSelector],
  defaultStyle => mergeStyles(defaultStyle, R.propOr({}, 'style', props))
)(state, props);

/**
 * Like makeMergeDefaultStyleWithProps but used to merge the container style props with the component style props
 * @param {Object} containerProps The props coming from the container, which themselves were merged with the
 * state styles and/or parent components
 * @param {Object} style The style object with simple values
 * @param {Object} [props] Optional The props The style object with simple values or
 * unary functions to transform the values from the containerProps (e.g. { margin: 2, color: 'red', border: scale(2) })
 * where scale(2) returns a function that transforms the border property from the containerProps
 * @returns {Object} The merged object
 */
export const makeMergeContainerStyleProps = () => (containerProps, style) => createSelector(
  [
    containerProps => reqPath(['style'], containerProps),
    (_, props) => R.defaultTo({}, props)
  ],
  mergeStyles
)(containerProps, style);