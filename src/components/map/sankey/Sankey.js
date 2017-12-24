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

import mapGl from 'react-map-gl';
import {throwing} from 'rescape-ramda';
import {
  composeViews, eMap, errorOrLoadingOrData, nameLookup, propsFor,
  propsForSansClass
} from 'helpers/componentHelpers';
import * as R from 'ramda';
import {styleMultiplier} from 'helpers/styleHelpers';
import {applyMatchingStyles, mergeAndApplyMatchingStyles} from 'selectors/styleSelectors';
import {Component} from 'react/cjs/react.production.min';

const [MapGL, DeckGL, Svg, G, Circle, Div] =
  eMap([mapGl, deckGL, 'svg', 'g', 'circle', 'div']);

export const c = nameLookup({
  sankey: true,
  asankeyMapGlOuter: true,
  sankeyMapGl: true
});
const {reqPath} = throwing;

/**
 * The View for a Sankey on a Map
 */
class Sankey extends Component {
  render() {
    const props = this.views(this.props);
    return Div(propsFor(c.sankey, props.views),
      errorOrLoadingOrData(
        this.renderLoading,
        this.renderError,
        this.renderData
      )(props)
    );
  }
}

Sankey.getStyles = ({style}) => {
  return {
    [c.sankey]: mergeAndApplyMatchingStyles(style, {
      position: 'absolute',
      width: styleMultiplier(1),
      height: styleMultiplier(1)
    }),

    [c.sankeyMapGl]: applyMatchingStyles(style, {
      width: styleMultiplier(1),
      height: styleMultiplier(1)
    })
  };
};

Sankey.viewProps = () => {
  return {
    [c.sankeyMapGl]: {
      // Width and height are calculated in getStyles
      width: reqPath(['views', [c.mapboxMapGl], 'style', 'width']),
      height: reqPath(['views', [c.mapboxMapGl], 'style', 'height']),
      latitude: 'viewport.latitude',
      longitude: 'viewport.longitude',
      zoom: 'viewport.zoom'
      //osm: 'store.region.geojson.osm'
    }
  };
};

Sankey.viewActions = () => {
  return {
    [c.sankeyMapGl]: ['onViewportChange', 'hoverMarker', 'selectMarker']
  };
};

Sankey.renderData = ({views}) => {
  /* We additionally give Mapbox the container width and height so the map can track changes to these
   We have to apply the width and height fractions of this container to them.
   */
  const props = R.flip(propsFor)(views);
  const propsSansClass = R.flip(propsForSansClass)(views);

  return Div(props(c.mapboxMapGlOuter),
    MapGl(propsSansClass(c.mapboxMapGl))
  );
};

Sankey.renderLoading = ({data}) => {
  return [];
};

Sankey.renderError = ({data}) => {
  return [];
}

/**
 * Adds to props.views for each component configured in viewActions, viewProps, and getStyles
 * @param {Object} props this.props or equivalent for testing
 * @returns {Object} modified props
 */
Sankey.views = composeViews(
  Sankey.viewActions(),
  Sankey.viewProps(),
  Sankey.getStyles
);

/**
 * Loading, Error, or Data based on the props
 */
Sankey.choicepoint = errorOrLoadingOrData(
  Sankey.renderLoading,
  Sankey.renderError,
  Sankey.renderData
);

Sankey.propTypes = {
  data: PropTypes.shape().isRequired,
  style: PropTypes.shape().isRequired
}

export default Sankey;

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
