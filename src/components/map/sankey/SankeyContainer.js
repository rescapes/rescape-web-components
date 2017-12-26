/**
 * Created by Andy Likuski on 2017.02.06
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {onViewportChange} from 'redux-map-gl';
import Sankey from './Sankey'
import {viewportSelector} from 'selectors/mapboxSelectors'
import {
  makeActiveUserAndSettingsSelector
} from 'selectors/storeSelectors';

import {createSelector} from 'reselect';
import {mergeDeep, throwing} from 'rescape-ramda';
import {loadingCompleteStatus, makeTestPropsFunction, mergeActionsForViews} from 'helpers/componentHelpers';
import {makeMergeDefaultStyleWithProps} from 'selectors/styleSelectors';
import * as R from 'ramda';
const {reqPath} = throwing
//const {hoverMarker, selectMarker} = actionCreators;

export const mapStateToProps = (state, props) => {
  const {style, ...data} = props;
  return createSelector(
    [
      makeActiveUserAndSettingsSelector(),
      makeMergeDefaultStyleWithProps(),
      viewportSelector
    ],
    (stateData, defaultStyle, viewport) => ({
      data: R.mergeAll([
        stateData,
        {viewport},
        loadingCompleteStatus,
        data
      ]),
      style: R.merge(defaultStyle, style)
    })
  )(state, props);
};

export const mapDispatchToProps = (dispatch, ownProps) => {
  return bindActionCreators({
    onViewportChange,
    //hoverMarker,
    //selectMarker
  }, dispatch);
};

/**
 * Combines mapStateToProps, mapDispatchToProps with the given viewToActions mapping
 * @type {Function}
 */
export const mergeProps = mergeActionsForViews({
  // MapGl child component needs the following actions
  mapboxMapGl: ['onChangeViewport', 'hoverMarker', 'selectMarker']
})

// Returns a function that expects a sample state and ownProps for testing
export const testPropsMaker = makeTestPropsFunction(mapStateToProps, mapDispatchToProps, mergeProps)

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Sankey)
