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
import {resolveSvgPoints} from 'helpers/svgHelpers';
import {asUnaryMemoize} from 'selectors/selectorHelpers';
import {BART_SAMPLE} from 'data/samples/oakland-sample/oaklandLocations.sample';
import {mergeDeep} from 'rescape-ramda';
import {Point} from '@turf/helpers'

const round = x => Math.round(x * 10) / 10;

/**
 * Calculates teh x, y, dx, and dy representing a node based on the
 * x, y, x1, y1 of the geographic point representing the node
 * @param node
 * @param point
 * @return {{x: *, dx: *, y: *, dy: *}}
 */
export const nodeProjected = (opt, node) => {
  // Find the center of the node
  const centerPoint = Point(
    R.map((_1, _2) => R.divide(R.subtract(R.prop(_2, node), R.prop(_1, node)), 2))[['x1', 'x2'], ['y1', 'y2']]
  )
  // Transform the node points to that
  const points = resolveSvgPoints(opt, node).points
  const [x,y] = node.points[0]
  const point = {x, y}
  R.merge(
    node,
    {
      x: round(point.x),
      dx: round(node.x1 - node.x0),
      y: round(point.y),
      dy: round(node.y1 - node.y0)
    }
  );
}

export const linkProjected = R.curry((opt, link) => ({
  source: nodeProjected(opt, link.source),
  target: nodeProjected(opt, link.target),
  dy: round(link.width),
  sy: round(link.y0 - link.source.y0 - link.width / 2),
  ty: round(link.y1 - link.target.y0 - link.width / 2)
}));


/**
 * This needs to be debugged
 * @param opt
 * @param opt.width The width of the containing svg element
 * @param opt.height The height of the containing svg element
 * @param {Object} sankeyData. An object with a nodes key and links key
 * @param {[Object]} sankeyData.nodes A list of objects that must have a name at a minimum
 * @param {[Object]} sankeyData.links A list of objects that must have a source and target index into the
 * nodes array and must have a value indicating the weight of the headerLink
 * @returns {null}
 */
export const sankeyGenerator = asUnaryMemoize(({width, height, opt}, sankeyData) => {
  // d3 mutates the data
  const data = R.clone(sankeyData);
  // Create a sankey generator
  const sankeyGenerator = sankey()
  // TODO pass from parent
    .nodeWidth(15)
    .nodePadding(10)
    // unproject from pixes to lat/lon
    .extent([opt.unproject([1, 1]), opt.unproject([width, height])]);

  // Map sample nodes to sample features
  const features = R.zipWith((node, feature) =>
      mergeDeep(
        feature,
        {
          name: feature.properties.name || node.name,
          properties: {
            name: feature.properties.name || node.name
          },
        }
      ),
    data.nodes,
    R.uniqBy(feature => feature.properties.name, BART_SAMPLE.features)
  );

  // Create an svg.g element (headerLink) and select all paths
  // Our links our drawn as paths
  /*
  let headerLink = svg.append("g")
    .attr("class", "links")
    .attr("fill", "none")
    .attr("stroke", "#000")
    .attr("stroke-opacity", 0.2)
    .selectAll("path");
  */

  // Call the generator with the features as nodes and the original links
  // This updates the links and nodes.
  //
  // It gives each node a sourceLinks array  and a targetLinks array that reference the links. It also gives each node
  // an x0, y0, x1, y2 to indicate its rectangular bounds. It also gives an index, depth, and value (not sure what
  // depth and value are for yet. value is calculate from the headerLink values)

  // It gives each a source and target reference to its nodes as well as
  // a y0, y1, and width to indicate its start y and end y and width of the path
  // The y0 and y1 are some portion of the vertical service of the two nodes (I think),
  // although there must be more to it since they have to attach to two nodes at different y positions
  // It also gives each headerLink an index
  const update = {links: data.links, nodes: features};
  sankeyGenerator(update);

  // nodes in the right place on the map
  //const positionedNodes = R.zipWith(nodeProjected, data.nodes, R.map(R.prop('geometry'), features));

  // This could be used to create react object from the features
  //const reactSvgs = resolveSvgReact(opt, features);
  return update;
});
