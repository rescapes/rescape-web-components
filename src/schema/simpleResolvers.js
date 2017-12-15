/**
 * Created by Andy Likuski on 2017.11.29
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import {addResolveFunctionsToSchema} from 'graphql-tools';
import * as R from 'ramda'
import {throwing} from 'rescape-ramda'
const {reqPath} = throwing
const objectValues = field => (obj) => R.values(reqPath([field], obj))

// Original example from: https://github.com/apollographql/graphql-tools
const makeSimpleResolvers = data => ({
  Operation: {

  },
  Permission: {
    operations: objectValues('operations')
  },
  User: {
    permissions: objectValues('permissions')
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
    name(obj, args) {
      return obj.name
    },
  },
  MapboxSettings: {

  },
  ApiSettings: {

  },
  OverpassSettings: {

  },
  Settings: {

  },
  Store: {
    regions: objectValues('regions'),
    users: objectValues('users'),
    settings: objectValues('settings')
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
 * Modifies the given schema to add simple resolvers
 * @param {Object} schema A GraphlQL SchemaObject
 * @param {Object} data A full data structure that matches
 * the structure the schema
 * @returns {Object} The given GraphQLSchema with resolvers added
*/
export const createSimpleResolvedSchema = (schema, data) => {
  addResolveFunctionsToSchema(schema, makeSimpleResolvers(data))
  return schema
}

