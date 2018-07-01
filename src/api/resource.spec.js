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
  locationsToCategorizedODPairs, locationToODPair, queryLocations,
  queryLocationsTask
} from './resource';
import {authClientOrLoginTask} from 'rescape-apollo';
import {defaultLocationCategorizationConfig} from './resource.sample';
import {testAuthorization} from 'rescape-apollo';
import {defaultRunConfig} from 'rescape-ramda'

describe('location', () => {
  test('queryLocations', (done) => {
    R.pipeK(
      authClientOrLoginTask,
      // Query on different values and combine the results into a single Task
      ({authClient}) => R.traverse(
        of,
        value => queryLocationsTask(
          authClient,
          {city: "Washington", data: {sidewalk: value}}
        ),
        [0, 1]
      )
    )(testAuthorization).run().listen(defaultRunConfig({
        onResolved:
          response => {
            R.forEach(
              ({locations}) => expect(R.length(locations)).toBeGreaterThan(0),
              response
            );
            done();
          }
      })
    );
  }, 5000);

  test('locationsToCategorizedODPairs', () => {
    const locations = [
      {
        id: 11,
        blockname: 'Main St',
        intersc1: 'Elm St',
        intersc2: 'Maple St',
        city: 'Normal',
        state: 'Denial',
        country: 'USA',
        data: {Sidewalk: 0}
      },
      {
        id: 22,
        blockname: 'Broadway',
        intersc1: 'Almond Rd',
        intersc2: 'Walnut Rd',
        city: 'Anytown',
        state: 'Denial',
        country: 'USA',
        data: {Sidewalk: 0}
      },
      {
        id: 33,
        blockname: 'Kongensgate',
        intersc1: 'Karl Johans gate',
        intersc2: 'Prinsens gate',
        city: 'Oslo',
        country: 'Norway',
        data: {Sidewalk: 1}
      },
      {
        id: 44,
        blockname: 'Kirkegate',
        intersc1: 'Karl Johans gate',
        intersc2: 'Prinsens gate',
        city: 'Oslo',
        country: 'Norway',
        data: {Sidewalk: 1}
      }
    ];
    expect(locationsToCategorizedODPairs(
      defaultLocationCategorizationConfig,
      locations
    )).toEqual(
      {
        sidewalk: {
          no: {
            11: ['Main St and Elm St, Normal, Denial, USA', 'Main St and Maple St, Normal, Denial, USA'],
            22: ['Broadway and Almond Rd, Anytown, Denial, USA', 'Broadway and Walnut Rd, Anytown, Denial, USA']
          },
          yes: {
            33: ['Kongensgate and Karl Johans gate, Oslo, Norway', 'Kongensgate and Prinsens gate, Oslo, Norway'],
            44: ['Kirkegate and Karl Johans gate, Oslo, Norway', 'Kirkegate and Prinsens gate, Oslo, Norway']
          }
        }
      }
    );
  });

  test('locationToODPair', () => {
    const location = {
      blockname: 'Main St',
      intersc1: 'Elm St',
      intersc2: 'Maple St',
      city: 'Anytown',
      state: 'Ohio',
      country: 'USA'
    };
    expect(locationToODPair(location)).toEqual(
      ['Main St and Elm St, Anytown, Ohio, USA', 'Main St and Maple St, Anytown, Ohio, USA']
    );
  });
});
