/**
 * Created by Andy Likuski on 2018.04.25
 * Copyright (c) 2018 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as R from 'ramda';
import {compactEmpty, mapKeys, mapObjToValues} from 'rescape-ramda';
import {authClientRequest} from './client';
import {makeQuery, authClientRequest} from 'rescape-apollo';

// data would default to Object, so we need to map it to the right type
const inputParamTypeMapper = {
  'data': 'ResourceRelatedReadInputType'
};
// Default output params for query. Just add more to these as needed.
// Later we'll let the user specify
const outputParams = [
  'id',
  'blockname',
  'intersc1',
  'intersc2',
  'city',
  'state',
  'country',
  {
    data: [
      'plazaSq',
      'sidewalk'
    ]
  }
];
const makeLocationsQuery = makeQuery('dataPoints', inputParamTypeMapper, outputParams);

/**
 * Query locations
 * @param {Object} authClient Authorized graphql client that contains an auth token in the header
 * @param {Object} queryParams query parameters for DataPoints
 * @returns {Task} A task containing an objects with a locations key holding the list of returned locations
 */
export const queryLocations = R.curry((authClient, queryParams) => {
  if (R.any(R.isNil, R.values(queryParams))) {
    throw new Error(`queryParams have null values ${queryParams}`);
  }
  return authClientRequest(authClient)(
    makeLocationsQuery(queryParams),
    queryParams
  );
});

/**
 * Chained Task to query datapoints and return datapoints and the queryParams
 * @param authClient
 * @param queryParams
 * @return {Task} A task containing the datapoints and the queryParams
 */
export const queryLocationsTask = (authClient, queryParams) => R.map(
  // The results from the API are currently dataPoints, but we use datapoints here
  locationsResult => ({queryParams, locations: R.prop('dataPoints', locationsResult)}),
  queryLocations(
    authClient,
    queryParams
  )
);

/**
 * Maps the location to its two resolveable intersections: blockname and intersc1 and blockname and intersc2
 * @param {Object} location The location containing a blockname, intersc1, intersc2, city, state, and country
 * In the future this should be a lat/lon
 * @return {[String]} The resolvable intersection names
 */
export const locationToODPair = location => {
  // Either state, country or just country is state is null or ''
  const stateCountry = R.join(', ', compactEmpty(R.map(prop => R.prop(prop, location), ['city', 'state', 'country'])));
  return R.map(
    intersectionProp => `${R.prop('blockname', location)} and ${R.prop(intersectionProp, location)}, ${stateCountry}`,
    ['intersc1', 'intersc2']
  );
};

/***
 * Groups location origin-destination pairs by a particular variable value
 * @param {[Object]} locationCategorizationConfig An array of objects with the following properties
 * @param {String} locationCategorizationConfig.dataPath Path to a value in the Location. Most data is under 'data',
 * such as 'data.Sidewalk', some such as intersc1 is top-level, thus 'intersc1'
 * @param {Object} locationCategorizationConfig.aliasMapping Flat map of Location path final keys to other values.
 * This exists since things are named badly now. E.g. {Sidewalk: 'sidewalk'}
 * @param {Object} locationCategorizationConfig.valueMapping Maps values to different names for use as keys.
 * For instance, {0: 'no', 1: 'yes'} to map the value at Location's dataPath from 0 to 'no' and 1 to 'yes'
 * This exists since things are named badly now. E.g. {Sidewalk: 'sidewalk'}
 * @param [{Object}] locations List of Locations returned by the API.
 * @returns A datastructure in the form: {
 *  [datapath final segment or alias]: {
 *    [value0 or valueMapping of value 0]: {
 *      [a location id with value0]: {
 *        location's od pair as resolvable location
 *      }
 *      [a location.id with value0]: {
 *        location's od pair as resolvable location
 *      }
 *      ...
 *    }
 *    [value1 or valueMapping of value 1]: {
 *      [a location.id with value1]: {
 *        location's od pair as resolvable location
 *      }
 *      [a location.id with value2]: {
 *        location's od pair as resolvable location
 *      }
 *      ...
 *    }
 *    ...
 *  }
 * }
 */
export const locationsToCategorizedODPairs = R.curry((locationCategorizationConfig, locations) => {
  return R.fromPairs(R.map(({datapath, aliasMapping, valueMapping}) => {
    // Take the locationPath's last segment to use as the outer key of our data structure
    // and correct the name with the alias mapping if needed
    // e.g. if datapath is 'data.Sidewalk' and alias mapping {Sidewalk: 'sidewalk'}, returns 'sidewalk'
    // This is kind of silly now but will be useful when processing multiple datapath values in the future
    const locationKey = R.propOr(datapath, R.last(R.split('.', datapath)), aliasMapping);
    // Lens to the each location's datapath
    const lens = R.lensPath(R.split('.', datapath));
    // pairs of resolved lens value to location
    const keyLocationPairs = R.map(location => [R.view(lens, location), location], locations);
    // Make a map keyed by each key and valued by all location OD pairs whose value matches the same key,
    const keyToValueToODPairs = R.reduce(
      (all, [key, location]) => R.over(
        // Resolve the existing all[key]
        R.lensProp(key),
        // Merge the existing value or default {} with {id: [origin location name, destination location name]}
        v => R.merge(
          v || {},
          {[location.id]: locationToODPair(location)}
        ),
        all
      ),
      {},
      keyLocationPairs
    );
    // Map each location datapath value, which is now a key, to the preferred value if there is one
    const keyMapping = key => R.propOr(key, key, valueMapping);
    return [[locationKey], mapKeys(keyMapping, keyToValueToODPairs)];
  }, locationCategorizationConfig));
});