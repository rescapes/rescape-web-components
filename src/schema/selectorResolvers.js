/**
 * Created by Andy Likuski on 2017.12.01
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {mapboxSettingsSelector} from 'selectors/selectorHelpers';

const {addResolveFunctionsToSchema} = require('graphql-tools');
const R = require('ramda')
const {throwing: {reqPath}} = require('rescape-ramda')
const objectValues = field => (obj) => R.values(reqPath([field], obj))
const selectorValues = selector => obj => R.values(selector(obj))
const { settingsSelector, makeRegionsSelector, activeUserSelector} = require('selectors/selectorHelpers');

// Original example from: https://github.com/apollographql/graphql-tools
const makeSelectorResolvers = data => ({
  Operation: {

  },
  Permission: {
    operations: objectValues('operations')
  },
  User: {
    permissions: objectValues('permissions'),
    regions:
  },
  OpenStreetMap: {
    features: objectValues('features')
  },
  Location: {
    features: objectValues('features')
  },
  Geojson: {
    locations: objectValues('locations')
  },
  Bounds: {

  },
  Geospatial: {

  },
  Viewport: {

  },

  Mapbox: {

  },

  Region: {
    makeRegionSelector()
  },

  MapboxSettings: {
    // Default resolve store.settings.mapbox
  },

  ApiSettings: {
    // Default resolve store.settings.api
  },

  OverpassSettings: {
    // Default Resolve store.settings.overpass
  },

  Settings: {
    // Resolves store.settings.mapbox
    mapbox: selectorValues(mapboxSettingsSelector),
  },

  Store: {
    // Resolves store.settings
    settings: selectorValues(settingsSelector),
    // Resolves store.regions
    regions: selectorValues(makeRegionsSelector()),
    // Resolves store.users
    users: selectorValues(activeUserSelector)
  },

  Query: {
    store(obj, args) {
      return data
    },
  },

  /*
  Mutation: {
    upvotePost(_, { postId }) {
      const post = find(posts, { id: postId });
      if (!post) {
        throw new Error(`Couldn't find post with id ${postId}`);
      }
      post.votes += 1;
      return post;
    },
  },
  */
});

/**
 * Modifies the given schema to add reselect functions as resolvers
 * The reselect selectors represent the way that we filter data for Components
 * by, for instance, limited the Regions to the one marked active
 * @param {Object} schema A GraphlQL SchemaObject
 * @param {Object} data A full data structure that matches
 * the structure the schema
 * @returns {Object} The given GraphQLSchema with resolvers added
 */
module.exports.createSelectorResolvedSchema = (schema, data) => {
  addResolveFunctionsToSchema(schema, makeSelectorResolvers(data))
  return schema;
}