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

import {gql} from 'apollo-client-preset';

/**
 * The TypeDefs that define the structure of our data store on the client
 * These are resolved using resolvers, either in a test data environment or against running database
 */
export default typeDefs = gql`
    type Permssion {
        id: ID!
        name: String
    }

    type User {
        id: ID!
        name: String
        email: String
        password: String
        permissions: [Permission]
    }

    type Osm {
    }

    type Location {
    }

    type GeoJson {
        osm: Osm
        locations: [Location]
    }

    type Bounds {
        min: PointObject
        max: PointObject
    }

    type Geospatial {
        bounds: Bounds
    }

    type Viewport {
        latitude: Float
        longitude: Float
    }

    type Mapbox {
        viewport: Viewport
    }

    type Region {
        id: ID!
        name: String
        description: String
        geojson: Geojson
        geospatial: Geospatial
        mapbox: Mapbox
    }

    type MapboxSettings {
        mapboxApiAccessToken: String
        iconAtlas: String
        showCluster: Boolean
    }
  
    type ApiSettingsType {
        protocol: String
        host: String
        port: String
        root: String
    }
  
    type OverpassSettings {
        cellSize: Int
        sleepBetweenCalls: Int
    }
  
    type Settings {
        id: ID!
        domain: String
        mapbox: MapboxSettings
        api: ApiSettings
        overpass: OverpassSettings
    }
  
    type Store {
        regions: [Region]
        users: [User]
        settings: [Settings]
    }
  
    type Query {
        store: Store
    }
  
    type Mutation {
        
    }
`;
