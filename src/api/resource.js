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
import {makeQuery, makeMutation, authClientRequest} from 'rescape-apollo';

// data would default to Object, so we need to map it to the right type
const inputParamTypeMapper = {
  'data': 'ResourceRelatedReadInputType'
};
// Default output params for query. Just add more to these as needed.
// Later we'll let the user specify
const outputParams = [
  'id',
  'name',
  {
    'data': [
      {
        'settings': [
          'defaultLocation',
          {
            'stages': [
              'key',
              'targets'
            ]
          }
        ]
      },
      'rawData',
      'material',
      {
        'graph': [
          {
            'nodes': [
              'name',
              'type',
              'value',
              {
                'geometry': [
                  'type',
                  'coordinates'
                ]
              },
              'properties',
              'propertyValues'
            ]
          },
          {
            'links': [
              'value',
              'source',
              'target'
            ]
          }
        ]
      }
    ]
  }
];

const makeResourcesQuery = makeQuery('resources', inputParamTypeMapper, outputParams);

const makeResourcesMutation = makeMutation('resources', resources, outputParams);

/**
 * Query resources
 * @param {Object} authClient Authorized graphql client that contains an auth token in the header
 * @param {Object} queryParams query parameters for DataPoints
 * @returns {Task} A task containing all objects with a resources key holding the list of returned resources
 */
export const queryResources = R.curry((authClient, queryParams) => {
  if (R.any(R.isNil, R.values(queryParams))) {
    throw new Error(`queryParams have null values ${queryParams}`);
  }
  return authClientRequest(authClient)(
    makeResourcesQuery(queryParams),
    queryParams
  );
});

/**
 * Create or update resources
 * @param {Object} authClient Authorized graphql client that contains an auth token in the header
 * @param {List} resources. List of Resource objects to update or create
 * @returns {Task} A task containing to create/update the Resources and return them
 */
export const mutateResources = R.curry((authClient, resources) => {
  if (R.any(R.isNil, R.values(resources))) {
    throw new Error(`resources have null values ${resources}`);
  }
  return authClientRequest(authClient)(
    makeResourcesMutation(resources),
    resources
  );
});

/**
 * Chained Task to query resources and return resources and the queryParams
 * @param authClient
 * @param queryParams
 * @return {Task} A task containing the resources and the queryParams
 */
export const queryResourcesTask = (authClient, queryParams) => R.map(
  resourcesResult => ({queryParams, resources: R.prop('resources', resourcesResult)}),
  queryResources(
    authClient,
    queryParams
  )
);

export const mutateResourcesTask = (authClient, resources) => R.map(
  /**
   * Creates the given resources. If they already exist (matching name and region), they are updated
   * @param resourcesResult
   * @return {{queryParams: *, resources: *}}
   */
  resourcesResult => ({queryParams, resources: R.prop('resources', resourcesResult)}),
  mutateResources(
    authClient,
    resources
  )
);