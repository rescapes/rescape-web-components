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

const {gql} = require('apollo-client-preset');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList
} = require('graphql');

/**
 * The TypeDefs that define the structure of our data store on the client
 * These are resolved using resolvers, either in a test data environment or against running database
 */

  // Permission operation
const operation = new GraphQLObjectType({
    name: 'Operation',
    fields: {
      id: {type: GraphQLString},
      name: {type: GraphQLString},
      description: {type: GraphQLString}
    }
  });

const user = new GraphQLObjectType({
    # User;
permission;
type;
Permssion;
{
  id: ID;
  !
    name;
:
  String;
  operations: [Operation];
}

type;
User;
{
  id: ID;
  !
    name;
:
  String;
  email: String;
  password: String;
  permissions: [Permission];
}

})
const feature = new GraphQLObjectType({
    # Features;
from;
OpenStreetMap;
type;
Osm;
{
  type: String;
  generator: String;
  copyright: String;
  timestamp: String;
  features: [GeoJSONInterface];
}

})
const geospatial = new GraphQLObjectType({
    # Geospatial;
Location;
type;
Location;
{
  type: String;
  generator: String;
  copyright: String;
  timestamp: String;
  features: [GeoJSONInterface];
}

})

const geojson = new GraphQLObjectType({
    # Container;
for all geospatial
data;
type;
Geojson;
{
  osm: Osm;
  locations: [Location];
}

})
const bounds = new GraphQLObjectType({
    # Bounds;
of;
a;
geospatial;
area;
type;
Bounds;
{
  min: PointObject;
  max: PointObject;
}

})

const geospatial = new GraphQLObjectType({
    # Defines;
the;
bounds;
and;
other;
properties;
of;
a;
geospatial;
area;
type;
Geospatial;
{
  bounds: Bounds;
}

})

const viewport = new GraphQLObjectType({
    # The;
Mapbox;
Viewport;
type;
Viewport;
{
  latitude: Float;
  longitude: Float;
}

})
const mapbox = new GraphQLObjectType({
    # Mapbox;
state;
type;
Mapbox;
{
  viewport: Viewport;
}

})
const region = new GraphQLObjectType({
    # A;
user;
defined;
geospatial;
region;
type;
Region;
{
  id: ID;
  !
    name;
:
  String;
  description: String;
  geojson: Geojson;
  geospatial: Geospatial;
  mapbox: Mapbox;
}
})
const settings = new GraphQLObjectType({

    # Settings;
for Mapbox
  type
MapboxSettings;
{
  mapboxApiAccessToken: String;
  iconAtlas: String;
  showCluster: Boolean;
}

})
const api = new GraphQLObjectType({
    # Api;
Settings;
type;
ApiSettingsType;
{
  protocol: String;
  host: String;
  port: String;
  root: String;
}
})
const overpass = new GraphQLObjectType({
    # Overpass;
Api(OpenStreetMap);
Settings;
type;
OverpassSettings;
{
  cellSize: Int;
  sleepBetweenCalls: Int;
}

})
const settings = new GraphQLObjectType({
    # Settings;
container;
type;
Settings;
{
  id: ID;
  !
    domain;
:
  String;
  mapbox: MapboxSettings;
  api: ApiSettings;
  overpass: OverpassSettings;
}

})
const store = new GraphQLObjectType({
    # Store;
corresponding;
to;
what;
we;
store;
on;
the;
client;
type;
Store;
{
  regions: [Region];
  users: [User];
  settings: [Settings];
}

})
const query = new GraphQLObjectType({
    # GraphQL;
Query;
type;
Query;
{
  store: Store;
}

})
const mutation = new GraphQLObjectType({
    # GraphQL;
Mutation;
type;
Mutation;
{

}
})

export new graphql.GraphQLSchema({query: queryType});