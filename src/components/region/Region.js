/**
 * Created by Andy Likuski on 2017.02.16
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import {getClassAndStyle, getStyleObj, styleMultiplier} from 'helpers/styleHelpers';
import mapbox from 'components/map/mapbox/MapboxContainer';
import sankey from 'components/map/sankey/SankeyContainer';
import markerList from 'components/map/marker/MarkerListContainer';
import PropTypes from 'prop-types';
import {makeMergeContainerStyleProps} from 'selectors/styleSelectors';
import {eMap} from 'helpers/componentHelpers';
import {mergeDeep, throwing} from 'rescape-ramda';
import * as R from 'ramda';
import {Component} from 'react/cjs/react.production.min';
import * as decamelize from 'decamelize';

const [Mapbox, Sankey, MarkerList, Div] = eMap([mapbox, sankey, markerList, 'div']);
const {reqPath} = throwing;

/**
 * The View for a Region, such as California. Theoretically we could display multiple regions at once
 * if we had more than one, or we could have a zoomed in region of California like the Bay Area.
 */
export default class Region extends Component {
  render() {
    const style = R.map(
      style => ({style}),
      this.getStyles(reqPath(['data', 'style'], this.props))
    );
    // Replace props.data.style with computed styles
    const props = R.over(R.lensProp('data'), data => mergeDeep(data, style), this.props);

    const renderChoicePoint = R.cond([
      [R.prop('loading'), (d) =>
        this.renderLoading(props)
      ],
      [R.prop('error'), () =>
        this.renderError(props)
      ],
      [R.T, () =>
        this.renderData(props)
      ]
    ]);

    return Div(getClassAndStyle('region', props.data.style),
      renderChoicePoint(reqPath(['data'], props))
    );
  }

  getStyles(style) {
    return makeMergeContainerStyleProps()(
      {
        style: {
          // Map props.styles to the root element
          region: style,
          // Just map width/height to mapbox. TODO this probably won't stand, but it's more of a proof of concept now
          mapbox: R.pick(['width', 'height'], style)
        }
      },
      {
        region: {
          position: 'absolute',
          width: styleMultiplier(1),
          height: styleMultiplier(1)
        },

        regionMapboxOuter: {
          position: 'absolute',
          width: styleMultiplier(.5),
          height: styleMultiplier(1)
        },

        regionLocationsOuter: {
          position: 'absolute',
          top: .02,
          left: .55,
          right: .05
        }
      });
  }

  renderData({views}) {
    /* We additionally give Mapbox the container width and height so the map can track changes to these
     We have to apply the width and height fractions of this container to them.
     */
    const propsClassAndStyle = (name, viewProps) => R.merge(
      getClassAndStyle(decamelize(name, '-'), R.propOr({}, name, viewProps)),
      R.omit(['style'], viewProps)
    );
    const propsAndStyle = (name, viewProps) => R.merge(
      getStyleObj(decamelize(name, '-'), R.propOr({}, name, viewProps)),
      R.omit(['style'], viewProps)
    );
    return [
      Div(propsClassAndStyle('region', views),
        Div(propsClassAndStyle('regionMapboxOuter', views),
          Mapbox(
            propsAndStyle('regionMapbox', views)
          ),
          Sankey(
            propsAndStyle('regionSankey', views)
          )
        ),
        Div(propsClassAndStyle('regionLocationsOuter', views),
          MarkerList(propsAndStyle('regionLocations', views))
        )
      )
    ];
  }

  renderLoading({data}) {
    return [];
  };

  renderError({data}) {
    return [];
  }
}

/**
 * Expect the region
 * @type {{region: *}}
 */
const {
  string, object, number, func, shape
} = PropTypes;

Region.propTypes = {
  settings: object.isRequired,
  region: shape({
    mapbox: shape({
      mapboxAccessToken: string.isRequired
    }).isRequired
  }).isRequired,
  style: object.isRequired,
  onRegionIsChanged: func.isRequired,
  fetchMarkersData: func.isRequired
};
