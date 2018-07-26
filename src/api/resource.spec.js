/**
 * Created by Andy Likuski on 2018.04.23
 * Copyright (c) 2018 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as R from 'ramda';
import {task, of} from 'folktale/concurrency/task';
import {
  resourcesToCategorizedODPairs, locationToODPair, queryResources,
  queryResourcesTask
} from './resource';
import {authClientOrLoginTask} from 'rescape-apollo';
import {defaultLocationCategorizationConfig} from './resource.sample';
import {testAuthorization} from 'rescape-apollo';
import {defaultRunConfig} from 'rescape-ramda';
import config from '../config';
import {sample_resources} from 'api/resource.sample';

const {settings: {api: {url}}} = config;
const craeteResource = () => {
  const resources = sample_resources;
  const task = R.pipeK(
    args => authClientOrLoginTask(url, args),
    // Query on different values and combine the results into a single Task
    ({authClient}) => queryResourcesTask(
      authClient,
      {name: "Minerals"}
    )
  )(testAuthorization);
};
describe('location', () => {

  test('cerewateResources', (done) => {
    const task = R.pipeK(
      args => authClientOrLoginTask(url, args),
      // Query on different values and combine the results into a single Task
      ({authClient}) => mutateResourcesTask(
        authClient,
        sample_resources)
    )(testAuthorization);
    task.run().listen(defaultRunConfig({
        onResolved:
          response => {
            expect(R.length(response.resources)).toEqual(1);
            done();
          }
      })
    );
  }, 5000)

  test('queryResources', (done) => {
    const task = R.pipeK(
      args => authClientOrLoginTask(url, args),
      // Query on different values and combine the results into a single Task
      ({authClient}) => queryResourcesTask(
        authClient,
        {name: "Minerals"}
      )
    )(testAuthorization);
    task.run().listen(defaultRunConfig({
        onResolved:
          response => {
            expect(R.length(response.resources)).toEqual(1);
            done();
          }
      })
    );
  }, 5000);

});
