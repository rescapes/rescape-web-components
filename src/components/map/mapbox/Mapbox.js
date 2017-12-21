/**
 * Created by Andy Likuski on 2017.02.16
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import PropTypes from 'prop-types';
import mapGl from 'react-map-gl';
import React from 'react';
//import createMapStops from 'components/mapStop/index';
//import MapMarkers from 'components/mapMarker/index';
import {throwing} from 'rescape-ramda';
//import Deck from '../deck/Deck';
import {
  eMap, errorOrLoadingOrData, mergeActionsForViews, mergePropsForViews, mergeStylesIntoViews,
  nameLookup, propsFor
} from 'helpers/componentHelpers';
import * as R from 'ramda';
import {classNamer, getClassAndStyle, styleMultiplier} from 'helpers/styleHelpers';
import {applyMatchingStyles, makeMergeContainerStyleProps, mergeAndApplyMatchingStyles} from 'selectors/styleSelectors';
import {Component} from 'react/cjs/react.production.min';

const [Div, MapGl] = eMap(['div', mapGl]);
export const c = nameLookup({
  mapbox: true,
  mapGl: true
});

/**
 * The View for a Region, such as California. Theoretically we could display multiple regions at once
 * if we had more than one, or we could have a zoomed in region of California like the Bay Area.
 */
export default class Mapbox extends Component {
  render() {
    const props = R.compose(
      mergeActionsForViews(this.viewActions()),
      mergePropsForViews(this.viewProps()),
      mergeStylesIntoViews(this.getStyles),
    )(
      this.props
    );

    return Div(propsFor(c.mapbox, props.views),
      errorOrLoadingOrData(
        this.renderLoading,
        this.renderError,
        this.renderData
      )(props)
    );
  }

  getStyles({style}) {
    return mergeStylesIntoViews({
      [c.mapbox]: mergeAndApplyMatchingStyles(style, {
        position: 'absolute',
        width: styleMultiplier(1),
        height: styleMultiplier(1)
      }),

      [c.mapGl]: applyMatchingStyles(style, {
        width: styleMultiplier(1),
        height: styleMultiplier(1)
      })
    });
  }

  viewProps() {
    return {
      [c.mapGl]: {
        region: 'region',
        viewport: 'viewport'
      }
    }
  }

  viewActions() {
    return {
      [c.mapGl]: ['onChangeViewport', 'hoverMarker', 'selectMarker']
    }
  }

  renderData({views}) {
    /* We additionally give Mapbox the container width and height so the map can track changes to these
     We have to apply the width and height fractions of this container to them.
     */
    const props = R.flip(propsFor)(views);

    return [
      MapGl(props(c.mapGl))
    ];
  }

  renderLoading({data}) {
    return [];
  };

  renderError({data}) {
    return [];
  }
};

