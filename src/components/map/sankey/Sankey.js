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

import {renderSankeySvgPoints} from 'helpers/sankeyHelpers';
import PropTypes from 'prop-types';
import React from 'react';
import createMapStops from 'components/map/mapStop/MapStops';
import {throwing} from 'rescape-ramda';
import {geojsonByType} from 'helpers/geojsonHelpers';
import * as R from 'ramda';
import {sankey, sankeyLinkHorizontal} from 'd3-sankey';
import {mapDefault} from 'rescape-ramda';
import deckGL, {ScatterplotLayer, OrthographicViewport, COORDINATE_SYSTEM} from 'deck.gl';
import {eMap} from 'helpers/componentHelpers';
import sample from 'data/sankey.sample';
import * as d3 from 'd3';
import {resolveSvgPoints, resolveSvgReact} from 'helpers/svgHelpers';
import {getClass, styleMultiplier} from 'helpers/styleHelpers';
import {makeMergeContainerStyleProps} from 'selectors/styleSelectors'
import mapGl from 'react-map-gl'

const [MapGL, DeckGL, Svg, G, Circle, Div] =
  eMap([mapGl, deckGL, 'svg', 'g', 'circle', 'div']);
const {reqPath} = throwing;

/**
 *
 *
 *  // MapGl needs these props
 mapGlProps: {
            region: reqPath(['region'], props),
            viewport
          }
 */

const Sankey = (props) => {

  const nameClass = getClass('sankey');
  const styles = makeMergeContainerStyleProps()(
    {
      style: {
        root: reqPath(['style'], props)
      }
    },
    {
      root: {
        position: 'absolute',
        width: '100%',
        height: '100%'
      }
    });
  const {viewport, mapboxApiAccessToken} = props;
  const {width, height} = props.style;
  const left = -Math.min(width, height) / 2;
  const top = -Math.min(width, height) / 2;
  const glViewport = new OrthographicViewport({width, height, left, top});

  const deck = width && height &&
    Div({
      className: nameClass('root'),
      style: styles.root
    }, [
      Svg({
          viewBox: `0 0 ${width} ${height}`
        }
        // TODO first argument needs to be opt from the SVGOverlay layer. See MapMarkers
        //renderSankeySvgPoints(null, props, sample, this.refs.node)
      )
    ]);

  return MapGL(R.merge(viewport, {
      mapboxApiAccessToken,
      showZoomControls: true,
      perspectiveEnabled: true,
      // setting to `true` should cause the map to flicker because all sources
      // and layers need to be reloaded without diffing enabled.
      preventStyleDiffing: false,
      onViewportChange: this.props.onViewportChange
    }),
    deck
  );
};

/*
  componentWillReceiveProps(nextProps) {
    const osmLens = R.lensPath(['region', 'geojson', 'osm', 'features', 'length']);
    const markersLens = R.lensPath(['region', 'geojson', 'markers']);
    // Features have changed
    if (R.view(osmLens, this.props) !== R.view(osmLens, nextProps)) {
      this.setState({osmByType: geojsonByType(nextProps.region.geojson.osm)});
    }
    if (R.view(markersLens, this.props) !== R.view(markersLens, nextProps)) {
      this.setState({markers: nextProps.region.geojson.markers});
    }
  }
*/

const {
  string,
  object,
  bool,
  func
} = PropTypes;

Sankey.propTypes = {
  style: object.isRequired,
  viewport: object.isRequired,
  mapboxApiAccessToken: string.isRequired,
  iconAtlas: string.isRequired,
  showCluster: bool.isRequired,
  region: object.isRequired,
  hoverMarker: func.isRequired,
  selectMarker: func.isRequired,
  onViewportChange: func.isRequired,
  geojson: object.isRequired
};

export default Sankey;
