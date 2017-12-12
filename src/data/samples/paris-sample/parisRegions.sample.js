/**
 * Created by Andy Likuski on 2017.02.23
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import journeys from './parisJourneys.sample.json';
import locations from './parisUserLocations.sample.json';
import routes from './parisRoutes.sample'
import * as routeTypes from 'data/default/routeTypes';
import {applyDefaultRegion} from 'data/configHelpers';
import trips from './parisTrips.sample'
import stops from './parisStops.sample'
import osm from './parisOsm.sample'
import {throwing} from 'rescape-ramda'
const {reqPath} = throwing;

export const NORTH_BAY = 'North-Bay';
export const ALTAMONT = 'Altamont';
export const EAST_BAY = 'East-Bay';

// merge the default region template with our region(s)
export default applyDefaultRegion({
  paris: {
    id: 'paris',
    name: 'Paris',
    description: "C'est la ville la plus fameuse",

    geojson: {
      osm,
      // Make these the same as osm features for now
      locations: reqPath(['features'], osm)
    },

    gtfs: {
      routes,
      trips,
      stops,
      routeTypes: [routeTypes.INTER_REGIONAL_RAIL_SERVICE]
    },

    travel: {
      journeys,
      locations
    },

    geospatial: {
      // bounds: [-125, 31, -113, 43]
      bounds: [-122.720306, 37.005783, -121.568275, 38.444660]
    },

    mapbox: {
      viewport: {
        latitude: 37,
        longitude: -119,
        zoom: 5
      }
    }
  }
});
