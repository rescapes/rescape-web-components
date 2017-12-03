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

import {FeatureCollectionObject, PointObject} from 'graphql-geojson';
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
  GraphQLBoolean
} = require('graphql');

/**
 * The TypeDefs that define the structure of our data store on the client
 * These are resolved using resolvers, either in a test data environment or against running database
 */
;

const OpenStreetMapType = new GraphQLObjectType({
  name: 'OpenStreetMap',
  fields: {
    type: {type: GraphQLString},
    generator: {type: GraphQLString},
    copyright: {type: GraphQLString},
    timestamp: {type: GraphQLString},
    features: {type: FeatureCollectionObject}
  }
});

// TODO this isn't correctly defined
const LocationType = new GraphQLObjectType({
  name: 'Location',
  fields: {
    type: {type: GraphQLString},
    generator: {type: GraphQLString},
    copyright: {type: GraphQLString},
    timestamp: {type: GraphQLString},
    features: {type: FeatureCollectionObject}
  }
});

const GeojsonType = new GraphQLObjectType({
  name: 'Geojson',
  fields: {
    osm: {type: OpenStreetMapType},
    locations: {type: new GraphQLList(LocationType)}
  }
});

const BoundsType = new GraphQLObjectType({
  name: 'Bounds',
  fields: {
    min: {type: PointObject},
    max: {type: PointObject}
  }
});

const GeospatialType = new GraphQLObjectType({
  name: 'Geospatial',
  fields: {
    bound: {type: BoundsType}
  }
});

// The Mapbox Viewport
const ViewportType = new GraphQLObjectType({
  name: 'Viewport',
  fields: {
    latitude: {type: GraphQLFloat},
    longitude: {type: GraphQLFloat},
    zoom: {type: GraphQLInt}
  }
});

// Mapbox state
const MapboxType = new GraphQLObjectType({
  name: 'Mapbox',
  fields: {
    viewport: {type: ViewportType}
  }
});

// A user defined geospatial region
const RegionType = new GraphQLObjectType({
  name: 'Region',
  fields: {
    id: {type: GraphQLString},
    name: {type: GraphQLString},
    description: {type: GraphQLString},
    geojson: {type: GeojsonType},
    geospatial: {type: GeospatialType},
    mapbox: {type: MapboxType}
  }
});


// Permission operation
const OperationType = new GraphQLObjectType({
  name: 'Operation',
  fields: {
    id: {type: GraphQLString},
    name: {type: GraphQLString},
    description: {type: GraphQLString}
  }
});

const PermissionType = new GraphQLObjectType({
  name: 'Permission',
  fields: {
    id: {type: GraphQLString},
    name: {type: GraphQLString},
    operations: {type: new GraphQLList(OperationType)}
  }
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: {type: GraphQLString},
    name: {type: GraphQLString},
    email: {type: GraphQLString},
    password: {type: GraphQLString},
    permissions: {type: new GraphQLList(PermissionType)},
    region: {type: new GraphQLList(RegionType)}
  }
});

// Settings for Mapbox
const MapboxSettingsType = new GraphQLObjectType({
  name: 'MapboxSettings',
  fields: {
    mapboxApiAccessToken: {type: GraphQLString},
    iconAtlas: {type: GraphQLString},
    showCluster: {type: GraphQLBoolean},
  }
})

// Api settings
const ApiSettingsType = new GraphQLObjectType({
  name: 'ApiSettings',
  fields: {
    protocol: {type: GraphQLString},
    host: {type: GraphQLString},
    port: {type: GraphQLString},
    root: {type: GraphQLString},
  }
})

// Overpass Api (OpenStreetMap) settings
const OverpassSettingsType = new GraphQLObjectType({
  name: 'OverpassSettings',
  fields: {
    cellSize: {type: GraphQLInt},
    sleepBetweenCalls: {type: GraphQLInt},
  }
})

// container for settings
const SettingsType = new GraphQLObjectType({
  name: 'Settings',
  fields: {
    id: {type: GraphQLString},
    mapbox: {type: MapboxSettingsType},
    api: {type: ApiSettingsType},
    overpass: {type: OverpassSettingsType},
  }
})

// Store corresponding to what we store on the client
const StoreType = new GraphQLObjectType({
  name: 'Store',
  fields: {
    regions: {type: new GraphQLList(RegionType)},
    users: {type: new GraphQLList(UserType)},
    settings: {type: new GraphQLList(SettingsType)},
  }
})

// GraphQL query type
const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    store: {type: StoreType},
  }
})

/*
const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
  }
})
*/

/***
 * Returns a GraphQLSchema instance
 */
export default () => new GraphQLSchema({
  query: QueryType,
  //mutation: MutationType
});