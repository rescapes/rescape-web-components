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
import {actionCreators} from 'src/redux/geojson/geojsonReducer';
import {onChangeViewport} from 'redux-map-gl';
import Mapbox from './Mapbox'
const {hoverMarker, selectMarker} = actionCreators;
import {v} from 'rescape-validate';
import PropTypes from 'prop-types';
import {createSelector} from 'reselect';
import * as R from 'ramda';
import {viewportSelector} from 'selectors/mapboxSelectors';

/**
 * Uses props as state and makes convenience views
 */
export const mapStateToProps = createSelector(
  [
    (state, props) => props,
    (state, props) => viewportSelector(props)
  ],
  (propsAsState, viewports) => R.merge(
    propsAsState,
    {
      views: {
        // Containers needed by multiple children
        viewports: viewportSelector(state)
      }
    }
  )
);

export const mapDispatchToProps = (dispatch, ownProps) => {
  return bindActionCreators({
    onChangeViewport,
    hoverMarker,
    selectMarker
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Deck);
