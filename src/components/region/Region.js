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
import {styleMultiplier} from 'helpers/styleHelpers';
import mapbox from 'components/mapbox/MapboxContainer'
import sankey from 'components/sankey/SankeyContainer'
import markerList from 'components/marker/MarkerListContainer'
import PropTypes from 'prop-types';
import {makeMergeContainerStyleProps} from 'selectors/selectorHelpers';
import {eMap} from 'helpers/componentHelpers';
import {throwing} from 'rescape-ramda'
import * as R from 'ramda';
import {classNamer} from 'helpers/styleHelpers';
const [Mapbox, Sankey, MarkerList, Div] = eMap([mapbox, sankey, markerList, 'div']);
const {reqPath} = throwing

/**
 * The View for a Region, such as California. Theoretically we could display multiple regions at once
 * if we had more than one, or we could have a zoomed in region of California like the Bay Area.
 */
const Region = ({...props}) => {

  const nameClass = classNamer('region');
  const styles = makeMergeContainerStyleProps()(
    {
      style: {
        // Map props.styles to the root element
        root: reqPath(['style'], props),
        // Just map width/height to mapbox. TODO this probably won't stand, but it's more of a test for now
        mapbox: R.pick(['width', 'height'], reqPath(['style'], props))
      }
    },
    {
      root: {
        position: 'absolute',
        width: styleMultiplier(1),
        height: styleMultiplier(1)
      },

      mapboxOuter: {},

      mapbox: {
        position: 'absolute',
        width: styleMultiplier(.5),
        height: styleMultiplier(1)
      },

      locations: {
        position: 'absolute',
        top: .02,
        left: .55,
        right: .05
      }
    });

  return Div({
      className: nameClass('root'),
      style: styles.root
    },
    /* We additionally give Mapbox the container width and height so the map can track changes to these
     We have to apply the width and height fractions of this container to them.
     */
    Div({
        className: nameClass('mapbox-outer'),
        style: styles.mapboxOuter
      },
      Mapbox(
        R.merge(
          props.views.mapbox,
          { style: styles.mapbox }
        )
      ),
      Sankey(
        R.merge(
          props.views.mapbox,
          { style: styles.mapbox }
        )
      )
    ),
    Div({
        className: nameClass('markers-outer'),
        style: styles.markers
      },
      MarkerList({})
    )
  );
};

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

export default Region;
