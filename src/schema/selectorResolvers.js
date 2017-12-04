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

const {addResolveFunctionsToSchema} = require('graphql-tools');
const R = require('ramda')
const {throwing: {reqPath}} = require('rescape-ramda')
// Trivial resolver for our dataSource, just strips keys and return values
const objectValues = field => (parent, props, {options: {state: dataSource}}) => R.values(reqPath([field], dataSource))
// Calls the given selector, treating the dataSource as the state and passing props through
const selectorValues = selector => (parent, props, {options: {state: dataSource}}) => selector(dataSource, props)
// Calls the given selector with the parent merged into the props at the given parentKey
const parantSelectorValues = (selector, parentKey) => (parent, props, {options: {state: dataSource}}) =>
  selector(dataSource, R.merge(props, {[parentKey]: parent}))

const { activeUserSelectedRegionsSelector, regionSelector} = require('selectors/regionSelectors');
const { settingsSelector} = require('selectors/settingsSelectors');
const { activeUserSelector} = require('selectors/userSelectors');

// Original example from: https://github.com/apollographql/graphql-tools
const makeSelectorResolvers = data => ({
  Operation: {

  },
  Permission: {
    operations: objectValues('operations')
  },
  User: {
    permissions: objectValues('permissions'),
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
  },

  // The resolvers here limit the user to the active user and regions to the active region(s)
  // A different resolver setup could load all regions of a user (for user admin) or all regions for (overall admin)
  Store: {
    // Resolves store.settings
    settings: selectorValues(settingsSelector),
    // Resolves the active region(s) of the active user
    regions: selectorValues(activeUserSelectedRegionsSelector),
    region: selectorValues(regionSelector),
    // Resolves the active user
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