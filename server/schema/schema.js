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

// server/schema/schema.js
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLList,
  GraphQLScalarType,
  GraphQLBoolean
} from 'graphql';
import {PointObject} from 'graphql-geojson';

const store = {};

const PermissionType = new GraphQLObjectType({
  name: 'Permission',
  fields: () => ({
    id: {type: GraphQLString},
    name: {type: GraphQLString}
  })
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {type: GraphQLString},
    name: {type: GraphQLString},
    email: {type: GraphQLString},
    password: {type: GraphQLString},
    permissions: {
      type: new GraphQLList(PermissionType),
      resolve: () => employeesJSON
    }
  })
});

const OsmType = new GraphQLObjectType({
  name: 'Osm'
});

const LocationType = new GraphQLObjectType({
  name: 'Location'
});

const GeojsonType = new GraphQLObjectType({
  name: 'Geojson',
  fields: () => ({
    osm: {
      type: OsmType,
      resolve: () => employeesJSON
    },
    locations: {
      type: new GraphQLList(LocationType),
      resolve: () => employeesJSON
    }
  })
});

const BoundsType = new GraphQLScalarType({
  name: 'Bounds',
  fields: () => ({
    min: {
      type: PointObject,
      resolve: () => employeesJSON
    },
    max: {
      type: PointObject,
      resolve: () => employeesJSON
    }
  })
});

const GeospatialType = new GraphQLObjectType({
  name: 'Geospatial',
  fields: () => ({
    bounds: {
      type: BoundsType,
      resolve: () => employeesJSON
    }
  })
});

const ViewportType = new GraphQLScalarType({
  name: 'Viewport',
  fields: () => ({
    latitude: {type: GraphQLFloat},
    longitude: {type: GraphQLFloat},
    zoom: {type: GraphQLInt}
  })
});

const MapboxType = new GraphQLObjectType({
  name: 'Viewport',
  fields: () => ({
    viewport: {
      type: ViewportType,
      resolve: () => employeesJSON
    }
  })
});

const RegionType = new GraphQLObjectType({
  name: 'Region',
  fields: () => ({
    id: {type: GraphQLString},
    name: {type: GraphQLString},
    description: {type: GraphQLString},

    geojson: {
      type: GeojsonType,
      resolve: () => employeesJSON
    },

    geospatial: {
      type: GeospatialType,
      resolve: () => employeesJSON
    },

    mapbox: {
      type: MapboxType,
      resolve: () => employeesJSON
    }
  })
});

const MapboxSettingsType = new GraphQLScalarType({
  name: 'MapboxSettings',
  fields: () => ({
    mapboxApiAccessToken: {type: GraphQLString},
    iconAtlas: {type: GraphQLString},
    showCluster: {type: GraphQLBoolean}
  })
});

const ApiSettingsType = new GraphQLScalarType({
  name: 'ApiSettings',
  fields: () => ({
    protocol: {type: GraphQLString},
    host: {type: GraphQLString},
    port: {type: GraphQLString},
    root: {type: GraphQLString}
  })
});

const OverpassSettingsType = new GraphQLScalarType({
  name: 'OverpassSettings',
  fields: () => ({
    cellSize: {type: GraphQLInt},
    sleepBetweenCalls: {type: GraphQLInt},
  })
});

const SettingsType = new GraphQLObjectType({
  name: 'Settings',
  fields: () => ({
    id: {type: GraphQLString},
    domain: {type: GraphQLString},
    mapbox: {
      type: MapboxSettingsType,
      resolve: () => employeesJSON
    },

    api: {
      type: ApiSettingsType,
      resolve: () => employeesJSON
    },

    overpass: {
      type: OverpassSettingsType,
      resolve: () => employeesJSON
    }
  })
});

const StoreType = new GraphQLObjectType({
  name: 'Store',
  fields: () => ({
    regions: {
      type: new GraphQLList(RegionType),
      resolve: () => employeesJSON
    },
    users: {
      type: new GraphQLList(UserType),
      resolve: () => issuesJSON
    },
    settings: {
      type: new GraphQLList(SettingsType),
      resolve: () => customerJson
    }
  })
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    store: {
      type: StoreType,
      resolve: () => store
    }
  })
});

export default new GraphQLSchema({
  query: QueryType
});
