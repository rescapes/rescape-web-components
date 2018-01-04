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
//import {resolveSvgReact} from 'helpers/svgHelpers';

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

import reactMapGl, {SVGOverlay as svgOverlay} from 'react-map-gl';
import {throwing} from 'rescape-ramda';
import {
  composeViews, eMap, renderChoicepoint, itemizeProps, mergePropsForViews, nameLookup, propsFor,
  propsForSansClass, renderErrorDefault, renderLoadingDefault, keyWith
} from 'helpers/componentHelpers';
import * as R from 'ramda';
import {styleMultiplier} from 'helpers/styleHelpers';
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
const {reqPath, reqStrPath} = throwing;
const color = scaleOrdinal(schemeCategory10);

const [ReactMapGl, SVGOverlay, DeckGL, Svg, G, Rect, Text, Title, Path, Div] =
  eMap([reactMapGl, svgOverlay, deckGL, 'svg', 'g', 'rect', 'text', 'title', 'path', 'div']);

export const c = nameLookup({
  sankey: true,
  sankeyReactMapGlOuter: true,
  sankeyReactMapGl: true,
  sankeySvgOverlay: true,
  sankeySvg: true,
  sankeySvgLinks: true,
  sankeySvgLink: true,
  sankeySvgNodes: true,
  sankeySvgNode: true,
  sankeySvgNodeRect: true,
  sankeySvgNodeText: true,
  sankeySvgNodeTitle: true,
  sankeyLoading: true,
  sankeyError: true
});

/**
 * The View for a Sankey on a Map
 */
class Sankey extends Component {
  render() {
    const props = Sankey.views(this.props);
    return Div(propsFor(props.views, c.sankey),
      Sankey.choicepoint(props)
    );
  }
}

Sankey.viewStyles = ({style}) => {

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

    [c.sankeyReactMapGl]: applyMatchingStyles(parentStyle, {
      width: styleMultiplier(1),
      height: styleMultiplier(1)
    }),

    [c.sankeySvgOverlay]: applyMatchingStyles(parentStyle, {
      width: styleMultiplier(1),
      height: styleMultiplier(1)
    })
  };
};

Sankey.viewProps = (props) => {
  // Rely on the width and height calculated in viewStyles
  const width = reqPath(['views', [c.sankey], 'style', 'width'], props);
  const height = reqPath(['views', [c.sankey], 'style', 'height'], props);
  const left = -Math.min(width, height) / 2;
  const top = -Math.min(width, height) / 2;
  // Change the text position if the following is true
  const nodeTextCond = (_, d) => d.x0 < width / 2;
  return {
    [c.sankeyReactMapGl]: R.mergeAll([
      {
        width,
        height
      },
      // Pass anything in mapbox
      reqStrPath('data.mapbox', props),
      // Pass anything in viewport
      reqStrPath('data.viewport', props)
    ]),

    [c.sankeySvgOverlay]: {
      viewBox: `0 0 ${width / 2} ${height / 2}`
    },

    [c.sankeySvgNodes]: {
      key: 'svgNodes',
      fontFamily: 'sans-serif',
      fontSize: 10
    },

    [c.sankeySvgNode]: {
      key: R.curry((_, d) => d.name)
    },

    [c.sankeySvgNodeRect]: {
      key: 'svgNodeRect',
      x: R.curry((_, d) => R.prop('x0', d)),
      y: R.curry((_, d) => R.prop('y0', d)),
      height: R.curry((_, d) => R.subtract(d.y1, d.y0)),
      width: R.curry((_, d) => R.subtract(d.x1, d.x0)),
      fill: R.curry((_, d) => color(d.name.replace(/ .*/, ''))),
      stroke: '#000'
    },

    [c.sankeySvgNodeText]: {
      key: 'svgNodeText',
      x: R.curry((_, d) => R.ifElse(
        // Position text based on the condition
        nodeTextCond,
        (_, d) => R.add(d.x1, 6),
        (_, d) => R.subtract(d.x0, 6)
      )(_, d)),
      y: R.curry((_, d) => R.divide(R.add(d.y1, d.y0), 2)),
      dy: '0.35em',
      // Anchor text based on the condition
      textAnchor: R.curry((_, d) => R.ifElse(
        nodeTextCond,
        R.always('start'),
        R.always('end')
      )(_, d)),
      text: R.curry((_, d) => d.name),

      height: R.curry((_, d) => R.subtract(d.y1, d.y0)),
      width: R.curry((_, d) => R.subtract(d.x1, d.x0)),
      fill: R.curry((_, d) => color(d.name.replace(/ .*/, ''))),
      stroke: '#000'
    },

    [c.sankeySvgNodeTitle]: {
      key: 'svgNodeTitle',
      text: R.curry((_, d) => `${d.name}\n${format(d.value)}`)
    },

    [c.sankeySvgLinks]: {
      key: 'svgLinks',
      fontFamily: 'sans-serif',
      fontSize: 10
    },

    [c.sankeySvgLink]: keyWith('title', {
      fill: 'none',
      stroke: '#000',
      strokeOpacity: 0.2,
      // The d element of the svg path is produced by sankeyLinkHorizontal
      // Well call the result of sankeyLinkHorizontal on each datum
      d: _ => sankeyLinkHorizontal(),
      // The stroke is based on the item, so return a unary function
      // The stroke width must be at least 1 (pixel?)
      strokeWidth: R.curry((_, d) => Math.max(1, d.width)),
      // The title is based on the item, so return a unary function
      title: R.curry((_, d) => `${d.source.name} →  ${d.target.name} \n ${format(d.value)}`)
    })
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
  const width = reqPath([[c.sankeyReactMapGl], 'width'], views);
  const height = reqPath([[c.sankeyReactMapGl], 'height'], views);
  const {links, nodes} = sankeyGenerator({width, height}, sample);
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
    [c.sankeyReactMapGl]: ['onViewportChange', 'hoverMarker', 'selectMarker']
  };
};


Sankey.renderData = ({views}) => {
  /* We additionally give Mapbox the container width and height so the map can track changes to these
   We have to apply the width and height fractions of this container to them.
   */
  const props = propsFor(views);
  const propsSansClass = propsForSansClass(views);
  const linkProps = itemizeProps(props(c.sankeySvgLink));
  const nodeProps = itemizeProps(props(c.sankeySvgNode));
  const nodeRectProps = itemizeProps(props(c.sankeySvgNodeRect));
  const nodeTextProps = itemizeProps(props(c.sankeySvgNodeText));
  const nodeTitleProps = itemizeProps(props(c.sankeySvgNodeTitle));

  return Div(props(c.sankeyReactMapGlOuter),
    ReactMapGl(propsSansClass(c.sankeyReactMapGl),
      SVGOverlay(
        R.merge(
          props(c.sankeySvgOverlay),
          {
            // The redraw property of SVGOverlay
            redraw: opt => {
              // Update props that are dependent on the opt.project method
              const {views: projectedViews} = Sankey.viewPropsAtRender({views, opt});
              const projectedProps = propsFor(projectedViews);
              // Separate out our links and nodes, which are for iterating, from the container props
              const {links, ...linksProps} = projectedProps(c.sankeySvgLinks);
              const {nodes, ...nodesProps} = projectedProps(c.sankeySvgNodes);

              return [
                G(linksProps,
                  R.map(
                    d => SankeySvgLink(linkProps(d)),
                    links
                  )
                ),
                G(nodesProps,
                  R.map(
                    d => SankeySvgNode({
                      node: nodeProps(d),
                      rect: nodeRectProps(d),
                      text: nodeTextProps(d),
                      title: nodeTitleProps(d)
                    }),
                    nodes
                  )
                )
              ];
            }
          }
        )
      )
    )
  );
};


const SankeySvgNode = ({node, rect, text, title}) => {
  // Extract text element from props
  const {text: textText, ...textProps} = text;
  const {text: titleText, ...titleProps} = title;
  return G(node,
    Rect(rect),
    Text(textProps, textText),
    Title(titleProps, titleText)
  );
};

const SankeySvgLink = (props) => {
  return Path(props);
};


/**
 * Adds to props.views for each component configured in viewActions, viewProps, and viewStyles
 * @param {Object} props this.props or equivalent for testing
 * @returns {Object} modified props
 */
Sankey.views = composeViews(
  Sankey.viewActions(),
  Sankey.viewProps,
  Sankey.viewStyles
);

/**
 * Loading, Error, or Data based on the props
 */
Sankey.choicepoint = renderChoicepoint(
  renderErrorDefault(c.sankeyError),
  renderLoadingDefault(c.sankeyLoading),
  Sankey.renderData
);

Sankey.propTypes = {
  data: PropTypes.shape().isRequired,
  style: PropTypes.shape().isRequired
};

export default Sankey;
