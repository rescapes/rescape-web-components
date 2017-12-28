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
import {resolveSvgReact} from 'helpers/svgHelpers';

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

import mapGl, {SVGOverlay as svgOverlay} from 'react-map-gl';
import {throwing} from 'rescape-ramda';
import {
  composeViews, eMap, errorOrLoadingOrData, itemizeProps, mergePropsForViews, nameLookup, propsFor,
  propsForSansClass, renderErrorDefault, renderLoadingDefault, reqStrPath, strPath
} from 'helpers/componentHelpers';
import * as R from 'ramda';
import {applyStyleFunctionOrDefault, styleMultiplier} from 'helpers/styleHelpers';
import {applyMatchingStyles, mergeAndApplyMatchingStyles} from 'selectors/styleSelectors';
import {Component} from 'react';
import deckGL, {OrthographicViewport} from 'deck.gl';
import {sankeyGenerator} from 'helpers/sankeyHelpers';
import sample from 'data/sankey.sample';
import PropTypes from 'prop-types';
import {geoMercator, geoPath} from 'd3-geo';
import {sankeyLinkHorizontal} from 'd3-sankey';
import {format as d3Format} from 'd3-format';
import {scaleOrdinal, schemeCategory10} from 'd3-scale';

const projection = geoMercator();
const pathGenerator = geoPath().projection(projection);
const formatNumber = d3Format(",.0f");
const format = function (d) {
  return formatNumber(d) + " TWh";
};
const color = scaleOrdinal(schemeCategory10);

const [MapGL, SVGOverlay, DeckGL, Svg, G, Rect, Path, Div] =
  eMap([mapGl, svgOverlay, deckGL, 'svg', 'g', 'rect', 'path', 'div']);

export const c = nameLookup({
  sankey: true,
  asankeyMapGlOuter: true,
  sankeyMapGl: true,
  sankeySvgOverlay: true,
  sankeySvg: true,
  sankeySvgLinks: true,
  sankeySvgLink: true,
  sankeySvgNodes: true,
  sankeySvgNode: true,
  sankeyLoading: true,
  sankeyError: true
});
const {reqPath} = throwing;

/**
 * The View for a Sankey on a Map
 */
class Sankey extends Component {
  render() {
    const props = Sankey.views(this.props);
    return Div(propsFor(c.sankey, props.views),
      Sankey.choicepoint(props)
    );
  }
}

Sankey.getStyles = ({style}) => {

  const parentStyle = R.merge(
    {
      // default these parent styles
      width: '100%',
      height: '100%'
    },
    style
  );

  return {
    [c.sankey]: mergeAndApplyMatchingStyles(parentStyle, {
      position: 'absolute',
      width: styleMultiplier(1),
      height: styleMultiplier(1)
    }),

    [c.sankeyMapGl]: applyMatchingStyles(parentStyle, {
      width: styleMultiplier(1),
      height: styleMultiplier(1)
    })

  };
};

Sankey.viewProps = (props) => {
  // Rely on the width and height calculated in getStyles
  const width = reqPath(['views', [c.sankey], 'style', 'width'], props);
  const height = reqPath(['views', [c.sankey], 'style', 'height'], props);
  const left = -Math.min(width, height) / 2;
  const top = -Math.min(width, height) / 2;
  //const glViewport = new OrthographicViewport({width, height, left, top});
  return {
    [c.sankeyMapGl]: R.merge({
        width,
        height
      },
      // Pass anything in the viewport
      reqStrPath('data.viewport', props)
    ),
    [c.sankeySvg]: {
      viewBox: `0 0 ${width} ${height}`,
      features: strPath('data.region.geojson.features')
    },
    [c.sankeySvgOverlay]: {},

    [c.sankeySvgLinks]: {
      fill: 'none',
      stroke: '#000',
      strokeOpacity: 0.2
    },

    [c.sankeySvgNodes]: {
      fontFamily: 'sans-serif',
      fontSize: 10,
      x: R.prop('x0'),
      y: R.prop('y0'),
      height: R.curry((_, d) => R.subtract(d.y1, d.y0)),
      width: R.curry((_, d) => R.subtract(d.x1, d.x0)),
      fill: R.curry((_, d) => color(d.name.replace(/ .*/, ''))),
      stroke: '#000'
    },

    [c.sankeySvgLink]: {
      // The d element of the svg path is produced by sankeyLinkHorizontal
      // Well call the result of sankeyLinkHorizontal on each datum
      d: _ => sankeyLinkHorizontal(),
      // The stroke is based on the item, so return a unary function
      // The stroke width must be at least 1 (pixel?)
      strokeWidth: R.curry((_, d) => Math.max(1, d.width)),
      // The title is based on the item, so return a unary function
      title: R.curry((_, d) => `${d.source.name} →  ${d.target.name} \n ${format(d.value)}`)
    }
  };
};

/**
 * We have props that depend on Mapbox's project() method, which is only available at render time,
 * So merge in props that need projection
 * @param views
 * @param {Object} opt Properties of the SvgOverlay.redraw function
 * @param {Function} opt.project Projects SVG Points to the coordinate space of Mapbox
 */
Sankey.viewPropsAtRender = ({views, opt}) => {
  //resolveSvgReact(opt, this.props.geojson.features);
  // TODO these should be the SVG width/height
  const width = reqPath([[c.sankeyMapGl], 'width'], views);
  const height = reqPath([[c.sankeyMapGl], 'height'], views);
  const {links, nodes} = sankeyGenerator(opt, {width, height}, sample);
  return mergePropsForViews({
    [c.sankeySvgLinks]: {
      links
    },
    [c.sankeySvgNodes]: {
      nodes
    }
  }, {views});
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
  const linkProps = itemizeProps(props(c.sankeySvgLink));
  const nodeProps = itemizeProps(props(c.sankeySvgNode));

  return Div(props(c.mapboxMapGlOuter),
    MapGL(propsSansClass(c.mapboxMapGl),
      SVGOverlay(
        R.merge(
          props(c.sankeySvgOverlay),
          {
            // The redraw property of SVGOverlay
            redraw: opt => {
              // Update props that are dependent on the opt.project method
              const projectedViews = Sankey.viewPropsAtRender({views, opt});
              const projectedProps = R.flip(propsFor)(projectedViews);

              return Svg(props(c.sankeySvg),
                G(projectedProps(c.sankeySvgLinks),
                  R.map(
                    d => SankeySvgLink(linkProps(d)),
                    reqPath([c.sankeySvgLinks, 'links'])
                  )
                ),
                G(projectedProps(c.sankeySvgNodes),
                  R.map(
                    d => SankeySvgNode(nodeProps(d)),
                    reqPath([c.sankeySvgLinks, 'nodes'])
                  )
                )
              );
            }
          }
        )
      )
    )
  );
};


const SankeySvgNode = (props) => {
  return Rect(props);
};

const SankeySvgLink = (props) => {
  return Path(props);
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
  renderErrorDefault(c.sankeyError),
  renderLoadingDefault(c.sankeyLoading),
  Sankey.renderData
);

Sankey.propTypes = {
  data: PropTypes.shape().isRequired,
  style: PropTypes.shape().isRequired
};

export default Sankey;
