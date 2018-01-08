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
import {asUnaryMemoize} from 'selectors/selectorHelpers';
import {BART_SAMPLE} from 'data/samples/oakland-sample/oaklandLocations.sample';
import {mergeDeep} from 'rescape-ramda';

/**
 * This needs to be debugged
 * @param {Number} width The width of the containing svg element
 * @param {Number} height The height of the containing svg element
 * @param {Object} sankeyData. An object with a nodes key and links key
 * @param {[Object]} sankeyData.nodes A list of objects that must have a name at a minimum
 * @param {[Object]} sankeyData.links A list of objects that must have a source and target index into the
 * nodes array and must have a value indicating the weight of the headerLink
 * @returns {null}
 */
export const sankeyGenerator = asUnaryMemoize(({width, height}, sankeyData) => {
  // d3 mutates the data
  const data = R.clone(sankeyData);
  const nodeWidth = 15;
  const nodePadding = 15;

  // Create a sankey generator
  const sankeyGenerator = sankey()
  // TODO pass from parent
    .nodeWidth(nodeWidth)
    .nodePadding(nodePadding)
    .extent([[1, 1], [width, height]]);

  // Map sample nodes to sample features
  const features = R.zipWith((node, feature) =>
      mergeDeep(
        feature,
        {
          name: feature.properties.name || node.name,
          properties: {
            name: feature.properties.name || node.name
          }
        }
      ),
    data.nodes,
    R.uniqBy(feature => feature.properties.name, BART_SAMPLE.features)
  );

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
  return update;
});

/***
 * Mutates the nodes' x0, y0, x1, and y1 by unprojecting from pixels to lat/lon
 * @param node
 */
export const unprojectNode = R.curry((opt, node) => R.forEach(
  dim => [node[dim[0]], node[dim[1]]] = opt.unproject([node[dim[0]], node[dim[1]]]),
  [['x0', 'y0'], ['x1', 'y1']]));