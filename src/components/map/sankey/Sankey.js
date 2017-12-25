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
  propsForSansClass, reqStrPath
} from 'helpers/componentHelpers';
import * as R from 'ramda';
import {styleMultiplier} from 'helpers/styleHelpers';
import {applyMatchingStyles, mergeAndApplyMatchingStyles} from 'selectors/styleSelectors';
import {Component} from 'react/cjs/react.production.min';
import deckGL, {OrthographicViewport} from 'deck.gl';
import {renderSankeySvgPoints} from 'helpers/sankeyHelpers';
import sample from 'data/sankey.sample';
import PropTypes from 'prop-types';

const [MapGL, DeckGL, Svg, G, Circle, Div] =
  eMap([mapGl, deckGL, 'svg', 'g', 'circle', 'div']);

export const c = nameLookup({
  sankey: true,
  asankeyMapGlOuter: true,
  sankeyMapGl: true,
  svg: true
});
const {reqPath} = throwing;

/**
 * The View for a Sankey on a Map
 */
class Sankey extends Component {
  render() {
    const props = Sankey.views(this.props);
    return Div(propsFor(c.mapbox, props.views),
      Sankey.choicepoint(props)
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

Sankey.viewProps = (props) => {
  // Width and height need to be passed as properties
  const width = reqPath(['views', [c.sankey], 'style', 'width'], props);
  const height = reqPath(['views', [c.sankey], 'style', 'height'], props);
  const left = -Math.min(width, height) / 2;
  const top = -Math.min(width, height) / 2;
  //const glViewport = new OrthographicViewport({width, height, left, top});
  return {
    [c.sankeyMapGl]: R.merge({
        width: width,
        height: height
      },
      // Pass anything in the viewport
      reqStrPath('data.viewport', props)
    ),
    [c.svg]: {
      viewBox: `0 0 ${width} ${height}`
    }
    //osm: 'store.region.geojson.osm'
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
    MapGl(propsSansClass(c.mapboxMapGl),
      Svg(props(c.svg),
        // TODO first argument needs to be opt from the SVGOverlay layer. See MapMarkers
        renderSankeySvgPoints(null, props, sample, node)
      )
    )
  );
};

Sankey.renderLoading = ({data}) => {
  return [];
};

Sankey.renderError = ({data}) => {
  return [];
};

/**
 * Adds to props.views for each component configured in viewActions, viewProps, and getStyles
 * @param {Object} props this.props or equivalent for testing
 * @returns {Object} modified props
 */
Sankey.views = composeViews(
  Sankey.viewActions(),
  Sankey.viewProps,
  Sankey.getStyles
);

/**
 * Loading, Error, or Data based on the props
 */
Sankey.choicepoint = errorOrLoadingOrData(
  Sankey.renderError,
  Sankey.renderLoading,
  Sankey.renderData
);

Sankey.propTypes = {
  data: PropTypes.shape().isRequired,
  style: PropTypes.shape().isRequired
};

export default Sankey;
