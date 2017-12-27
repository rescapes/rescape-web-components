/**
 * Created by Andy Likuski on 2017.11.15
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as R from 'ramda';
import {sankey} from 'd3-sankey';
import * as d3 from 'd3';
import {resolveSvgPoints} from 'helpers/svgHelpers';
import {resolveSvgReact} from 'helpers/svgHelpers';

const DEGREE_TO_RADIAN = Math.PI / 180;
const NUM_POINTS = 2000;

const round = x => Math.round(x * 10) / 10;
const formatNumber = d3.format(",.0f"),
  format = function(d) { return formatNumber(d) + " TWh"; },
  color = d3.scaleOrdinal(d3.schemeCategory10);


/**
 * Calculates teh x, y, dx, and dy representing a node based on the
 * x, y, x1, y1 of the geographic point representing the node
 * @param node
 * @param point
 * @return {{x: *, dx: *, y: *, dy: *}}
 */
export const nodePosition = (node, point) => ({
  x: round(point.x),
  dx: round(node.x1 - node.x0),
  y: round(point.y),
  dy: round(node.y1 - node.y0)
});

export const linkPosition = link => ({
  source: nodePosition(link.source),
  target: nodePosition(link.target),
  dy: round(link.width),
  sy: round(link.y0 - link.source.y0 - link.width / 2),
  ty: round(link.y1 - link.target.y0 - link.width / 2)
});

/**
 * This needs to be debugged
 * @param opt
 * @param props
 * @param {Object} sankeyData. An object with a nodes key and links key
 * @param {[Object]} sankeyData.nodes A list of objects that must have a name at a minimum
 * @param {[Object]} sankeyData.links A list of objects that must have a source and target index into the
 * nodes array and must have a value indicating the weight of the link
 * @returns {null}
 */
export const sankeyGenerator = (opt, props, sankeyData) => {
  // Create a sankey generator
  const sankeyGenerator = sankey()
  // TODO pass from parent
    .nodeWidth(15)
    .nodePadding(10)
    // TODO. I don't know if the max extent is pixels or 1
    .extent([[1, 1], [props.style.width, props.style.height]]);

  // Map sample nodes to sample features
  const features = R.map(node =>
      ({
        type: 'Feature',
        properties: {
          '@id': 'node/27233097',
          'STIF:zone': '3',
          name: node.name,
          official_name: 'ASNIERES SUR SEINE',
          operator: 'SNCF',
          railway: 'station',
          'ref:SNCF': 'Transilien',
          'ref:SNCF:Transilien': 'J;L',
          source: 'survey',
          uic_ref: '8738113',
          wikipedia: 'fr:Gare d\'Asnières-sur-Seine',
          '@timestamp': '2016-05-27T08:20:46Z',
          '@version': '11',
          '@changeset': '39597830',
          '@user': 'overflorian',
          '@uid': '125897'
        },
        geometry: {
          type: 'Point',
          coordinates: [
            2.2834758,
            48.905901
          ]
        },
        id: 'node/27233097'
      }),
    sankeyData.nodes);

  // Create an svg.g element (link) and select all paths
  // Our links our drawn as paths
  let link = svg.append("g")
    .attr("class", "links")
    .attr("fill", "none")
    .attr("stroke", "#000")
    .attr("stroke-opacity", 0.2)
    .selectAll("path");

  // Create an svg.g element (node) and select all svg.g (node) g elements
  // Our links our drawn as individual g tags
  const node = svg.append("g")
    .attr("class", "nodes")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .selectAll("g");

  // Create the points needed to render the shape of each feature
  const pointsOfFeatures = resolveSvgPoints(opt, features);

  // Call the generator with the features as nodes and the original links
  // This updates the links and nodes.
  //
  // It gives each node a sourceLinks array  and a targetLinks array that reference the links. It also gives each node
  // an x0, y0, x1, y2 to indicate its rectangular bounds. It also gives an index, depth, and value (not sure what
  // depth and value are for yet. value is calculate from the link values)

  // It gives each a source and target reference to its nodes as well as
  // a y0, y1, and width to indicate its start y and end y and width of the path
  // The y0 and y1 are some portion of the vertical service of the two nodes (I think),
  // although there must be more to it since they have to attach to two nodes at different y positions
  // It also gives each link an index
  const graph = sankeyGenerator({links: sankeyData.links, nodes: features});

  const linkPaths = link
    // Assign data to the linkPaths
    .data(sankeyData.links)
    // On enter d3 appends a path element to the svg.g (Link) element
    .enter().append("path")
    // This seems to create the actual path based on the two nodes of the link
    .attr("d", d3.sankeyLinkHorizontal())
    // The stroke width must be at least 1 (pixel?)
    .attr("stroke-width", function(d) { return Math.max(1, d.width); });

  // Append a title element to each link svg path based on the names of the nodes and link value
  linkPaths.append("title")
    .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

  const nodeShapes = node
     // Assign data to the linkPaths
    .data(features)
    // Upon enter append a g svg element for each node
    .enter().append("g");

  // For each node
  nodeShapes.append("rect")
    // position x and y as caculated by the sankey generator
    .attr("x", function(d) { return d.x0; })
    .attr("y", function(d) { return d.y0; })
    // calculate height and width as the difference of the ys and xs, respectively
    .attr("height", function(d) { return d.y1 - d.y0; })
    .attr("width", function(d) { return d.x1 - d.x0; })
    // This seems to fill the node based on the last word of the node name ??
    .attr("fill", function(d) { return color(d.name.replace(/ .*/, "")); })
    // Stroke!
    .attr("stroke", "#000");

  // For each node and corresponding feature point, determine the d3 rectangle for the node
  // My hope is to use this instead of d3.sankeys automatic positioning, so that we can show the
  // nodes in the right place on the map
  const positionedNodes = R.zipWith(nodePosition, sankeyData.nodes, R.map(R.prop('geometry'), features));

  // This could be used to create react object from the features
  const reactSvgs = resolveSvgReact(opt, features);
};
