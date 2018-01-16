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

import reactMapGl, {SVGOverlay as svgOverlay} from 'react-map-gl';
import {throwing} from 'rescape-ramda';
import {
  composeViews, eMap, renderChoicepoint, itemizeProps, mergePropsForViews, nameLookup, propsFor,
  propsForSansClass, renderErrorDefault, renderLoadingDefault, keyWith
} from 'helpers/componentHelpers';
import * as R from 'ramda';
import {applyMatchingStyles, mergeAndApplyMatchingStyles} from 'selectors/styleSelectors';
import {Component} from 'react';
import {sankeyGenerator, sankeyGeospatialTranslate} from 'helpers/sankeyHelpers';
import graph, {linkStages, resolveLinkStage, resolveNodeStage, stages} from 'data/belgium/brusselsSankeySample';
import PropTypes from 'prop-types';
import {sankeyLinkHorizontal} from 'd3-sankey';
import {format as d3Format} from 'd3-format';
import {scaleOrdinal, schemeCategory10} from 'd3-scale';
import {resolveSvgReact} from 'helpers/svgHelpers';
import {Flex as flex} from 'rebass';
import sankeyNodeLegend from './SankeyNodeLegend'
import sankeyLinkLegend from './SankeyLinkLegend'
import sankeyFilterer from './SankeyFilterer';

// Sankey settings. These should be moved to style
const nodeWidth = 15;
const nodePadding = 15;

const formatNumber = d3Format(",.0f");
const format = function (d) {
  return formatNumber(d) + " TWh";
};
const {reqPath, reqStrPath} = throwing;
// Creates colors to use for the nodes
const color = scaleOrdinal(schemeCategory10);
// This creates the positioning for each Sankey Link.
const linkHorizontal = sankeyLinkHorizontal();


const [ReactMapGl, SVGOverlay, G, Text, Title, Path, Div, Flex, SankeyNodeLegend, SankeyLinkLegend, SankeyFilterer] =
  eMap([reactMapGl, svgOverlay, 'g', 'text', 'title', 'path', 'div', flex, sankeyNodeLegend, sankeyLinkLegend, sankeyFilterer]);

const styles = {
  sankeyLegendsFontFamily: 'sans-serif'
}

export const c = nameLookup({
  sankey: true,
  sankeyReactMapGl: true,
  sankeySvgOverlay: true,
  sankeySvg: true,
  sankeySvgLinks: true,
  sankeySvgLink: true,
  sankeySvgNodes: true,
  sankeySvgNode: true,
  sankeySvgNodeShape: true,
  sankeySvgNodeText: true,
  sankeySvgNodeTitle: true,
  sankeyFilterer: true,
  sankeyLegends: true,
  sankeyLegendNode: true,
  sankeyLegendLink: true,
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

Sankey.renderData = ({views}) => {
  /* We additionally give Mapbox the container width and height so the map can track changes to these
   We have to apply the width and height fractions of this container to them.
   */
  const props = propsFor(views);
  const propsSansClass = propsForSansClass(views);
  const nodeProps = itemizeProps(props(c.sankeySvgNode));
  const nodeTitleProps = itemizeProps(props(c.sankeySvgNodeTitle));

  return [
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

              // These run per item (per node or link) and need access to the opt in order to project the points
              const itemizeProjectedProps = R.compose(itemizeProps, projectedProps);
              const nodeShapeProps = itemizeProjectedProps(c.sankeySvgNodeShape);
              const nodeTextProps = itemizeProjectedProps(c.sankeySvgNodeText);
              const linkProps = itemizeProjectedProps(c.sankeySvgLink);

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
                      shape: nodeShapeProps(d),
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
    ),
    SankeyFilterer(propsSansClass(c.sankeyFilterer)),
    Flex(props(c.sankeyLegends), [
      SankeyNodeLegend(propsSansClass(c.sankeyLegendNode)),
      SankeyLinkLegend(propsSansClass(c.sankeyLegendLink)),
    ])
  ];
};

Sankey.viewStyles = ({style}) => {

  return {
    [c.sankey]: mergeAndApplyMatchingStyles(style, {
      position: 'relative'
    }),

    [c.sankeyReactMapGl]: applyMatchingStyles(style, {}),

    [c.sankeySvgOverlay]: applyMatchingStyles(style, {}),

    [c.sankeyLegends]: applyMatchingStyles(style, {
      position: 'absolute',
      bottom: 0,
      height: '350px',
      left: 0,
      width: '300px',
      flexDirection: 'column',
      justifyContent: 'space-between',
      margin: '10px 0 10px 0',
      fontFamily: styles.sankeyLegendsFontFamily
    }),

    [c.sankeyLegendNode]: applyMatchingStyles(style, {
      height: '200px'
    }),

    [c.sankeyLegendLink]: applyMatchingStyles(style, {
      height: '140px'
    }),

    [c.sankeyFilterer]: applyMatchingStyles(style, {
      position: 'absolute',
      top: 0,
      margin: '10px',
      height: '140px'
    })
  };
};

Sankey.viewProps = props => {
  // Rely on the width and height calculated in viewStyles
  const width = reqStrPath(`views.${c.sankey}.style.width`, props);
  const height = reqStrPath(`views.${c.sankey}.style.height`, props);
  return {
    [c.sankey]: {
      graph: props.data.graph
    },
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
      viewBox: `0 0 ${width} ${height}`
    },

    [c.sankeySvgNodes]: {
      key: 'svgNodes',
      fontFamily: 'sans-serif',
      fontSize: 10
    },

    [c.sankeySvgNode]: {
      key: R.always(R.join('-', [reqStrPath('material'), reqStrPath('name')]))
    },

    [c.sankeySvgNodeTitle]: {
      key: 'svgNodeTitle',
      children: R.always(d => `${d.name}\n${format(d.value)}`)
    },

    [c.sankeySvgLinks]: {
      key: 'svgLinks',
      fontFamily: 'sans-serif',
      fontSize: 10
    },

    [c.sankeyLegendNode]: {
      items: R.map(stage => R.merge(stage, {color: color(stage.name)}), stages),
      // Pass on Apollo status indicator
      data: props.data
    },

    [c.sankeyLegendLink]: {
      items: R.map(linkStage => R.merge(linkStage, {color: color(linkStage.target.name)}), linkStages),
      // Pass on Apollo status indicator
      data: props.data
    },

    [c.sankeyFilterer]: {
      items: R.map(node => ({material: node.material}), R.uniqBy(R.prop('material'), reqStrPath('graph.nodes', props))),
      // Pass on Apollo status indicator
      data: props.data
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
  // Change the text position if the following is true
  const nodeTextCond = d => d.x0 < width / 2;

  // opt contains the viewport width and height
  const {width, height} = opt;
  // Tranlate's a node's position (x0, y0, x1, y1) to that of the node's feature geometry
  // (Since the node is itself a feature)
  const geospatialPositioner = sankeyGeospatialTranslate(opt);
  // Generate the sankey diagram at default distributed positions across the map view
  const {links, nodes} = sankeyGenerator({width, height, nodeWidth, nodePadding, geospatialPositioner}, reqStrPath('graph', propsFor(c.sankey)));

  return mergePropsForViews({
    [c.sankeySvgLinks]: {
      links
    },
    [c.sankeySvgNodes]: {
      nodes
    },

    [c.sankeySvgNodeShape]: {
      key: c.sankeySvgNodeShape,
      pointData: R.always(d => d.pointData.bbox),
      fill: R.always(d => color(resolveNodeStage(d))),
      stroke: '#000',
      strokeWidth: '1'
    },

    // Make this whole thing a function that ignores props and expects the datum, since we combine
    // properties of the datum to make new properties (e.g. x0 and x1 to make x)
    [c.sankeySvgNodeText]: R.always(d => {
      return {
        key: c.sankeySvgNodeText,
        x: R.ifElse(
          // Position text based on the condition
          nodeTextCond,
          d => R.add(d.x1, 6),
          d => R.subtract(d.x0, 6)
        )(d),
        y: R.divide(R.add(d.y1, d.y0), 2),
        dy: '0.35em',
        // Anchor text based on the condition
        textAnchor: R.ifElse(
          nodeTextCond,
          R.always('start'),
          R.always('end')
        )(d),
        children: d.name,
        height: R.subtract(d.y1, d.y0),
        width: R.subtract(d.x1, d.x0),
        fill: color(resolveNodeStage(d)),
        stroke: '#000'
      };
    }),

    [c.sankeySvgLink]: keyWith('title', {
      fill: 'none',
      stroke: R.always(d => color(resolveLinkStage(d))),
      strokeOpacity: 0.2,
      // The d element of the svg path is produced by sankeyLinkHorizontal
      // Well call the result of sankeyLinkHorizontal(), which expects a datum and assigns
      // it y0, y1, and width
      d: R.always(d => linkHorizontal(d)),
      // The stroke is based on the item, so return a unary function
      // The stroke width must be at least 1 pixel
      strokeWidth: R.always(d => Math.max(1, reqStrPath('width', d))),
      // The title is based on the item, so return a unary function
      title: R.always(d => `${d.source.name} →  ${d.target.name} \n ${format(d.value)}`)
    })

  }, {views});
};

Sankey.viewActions = () => {
  return {
    [c.sankeyReactMapGl]: ['onViewportChange', 'hoverMarker', 'selectMarker']
  };
};


const SankeySvgNode = ({node, shape, text, title}) => {
  return G(node,
    resolveSvgReact(shape),
    Text(text),
    Title(title)
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
