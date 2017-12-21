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
import {onChangeViewport} from 'redux-map-gl';
import {makeMergeDefaultStyleWithProps} from 'selectors/styleSelectors';
import {viewportSelector} from 'selectors/mapboxSelectors';
import {makeActiveUserAndSettingsStateSelector} from 'selectors/storeSelectors';
import {createSelector} from 'reselect';
import {mergeActionsForViews, makeTestPropsFunction} from 'helpers/componentHelpers';
import {mergeDeep, throwing} from 'rescape-ramda';

const {reqPath} = throwing;
import Mapbox from './Mapbox';
import * as R from 'ramda';


/**
 * Selects the current user from state
 * and the Viewport for the region in the props
 * @returns {Object} The props
 */
export const mapStateToProps = (state, props) => {
  return createSelector(
    [
      makeActiveUserAndSettingsStateSelector(),
      makeMergeDefaultStyleWithProps(),
      viewportSelector
    ],
    (selectedState, style) => ({
      data: props,
      style
    })
  )(state, props);
};

export const mapDispatchToProps = (dispatch, ownProps) => {
  return bindActionCreators({
    onChangeViewport
    //hoverMarker,
    //selectMarker
  }, dispatch);
};

// Returns a function that expects a sample state and ownProps for testing
export const testPropsMaker = makeTestPropsFunction(mapStateToProps, mapDispatchToProps);

export default connect(mapStateToProps, mapDispatchToProps, R.merge)(Mapbox);

