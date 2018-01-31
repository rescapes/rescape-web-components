/**
 * Created by Andy Likuski on 2017.07.31
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRA/ACNTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
const R = require('ramda');
const {makeSampleInitialState} = require('helpers/jestHelpers');
const {assertSourcesSinks, cycleRecords} = require('rescape-cycle');
const xs = require('xstream').default;
const {
  locationCycleSources,
  makeSampleActionsAndResponses
} = require('./locationActions');

const state = makeSampleInitialState();
// Create sample request and response bodies
const {
  responses: {
    fetchLocationsRequestBody, addLocationsRequestBody, removeLocationsRequestBody,
    fetchLocationsSuccessBody, addLocationsSuccessBody, removeLocationsSuccessBody},
  actions,
  newObjs: {locations: newLocations},
  savedObjs: {locations: savedLocations}
} = makeSampleActionsAndResponses(state);

describe('cycleRecords', () => {
  test('User can add and fetch locations', (done) => {
    // Sources normally come from the user and from drivers (e.g. HTTP
    // Here we simulate the users invoking actions and the HTTP driver responding
    const testSources = R.merge(
      R.map(
        // Our configs sources are always single event streams, so each to a single 'a' event
        source => ({a: source}), locationCycleSources
      ),
      {
        ACTION: {
          // 1 User intends to add locations
          a: actions.addLocationsRequest(newLocations),
          // 3 User intends to fetch locations
          b: actions.fetchLocationsRequest(savedLocations),
          // 5 Users intends removes locations
          c: actions.removeLocationsRequest(R.slice(0, 2, savedLocations))
        },
        HTTP: {
          // HTTP responses are expected via the select method, which in real life has filtering arguments
          select: () => ({
            // 2 Respond to addLocationsRequest with addLocationsSuccessBody
            g: xs.of(addLocationsSuccessBody),
            // 4 Respond to fetchLocationsRequest with fetchLocationsSuccessBody
            h: xs.of(fetchLocationsSuccessBody),
            // 6 Respond to removeLocationsRequest with moveLocationsSuccessBody
            i: xs.of(removeLocationsSuccessBody)
          })
        }
      });

    const sinks = {
      // In response to actions
      // we expect to sink the following HTTP request bodies
      HTTP: {
        // 1 Expect this sink after ACTION's addLocationsRequest source
        r: addLocationsRequestBody,
        // 3 Expect this sink after ACTION's fetchLocationsRequest source
        s: fetchLocationsRequestBody,
        // 5 Expect this sink after ACTION's removeLocationsRequest source
        t: removeLocationsRequestBody
      },
      ACTION: {
        // In response to the HTTP sources return add and fetch response,
        // we expect to syn these action successes
        // 2 Expect this sink after HTTP's addLocationSuccess
        m: actions.addLocationsSuccess({data: savedLocations}),
        // 4 Expect this sink after HTTP's fetchLocationsSuccess
        n: actions.fetchLocationsSuccess({data: savedLocations}),
        // 6 Expect this sink after HTTP's removeLocationSuccess
        o: actions.removeLocationsSuccess({data: savedLocations})
      }
    };

    // Override the source drivers with our fake sources
    // The first marble diagram times when our source streams events happen,
    // The second marble diagram times when the sinks are expected in response to the sources
    // Notice that we can put whatever time delays we want in the sources (- is a unit of time)
    // But the sink must line up with the source in time because the incoming source and outgoing sink are synchronous
    assertSourcesSinks({
      ACTION:
        {'-a---b--c-|': testSources.ACTION},
      HTTP:
        {'---g---h-i|': testSources.HTTP},
      ACTION_CONFIG: {'a|': testSources.ACTION_CONFIG},
      CONFIG: {'a|': testSources.CONFIG}
    }, {
      HTTP:
        {'-r---s--t-|': sinks.HTTP},
      ACTION:
        {'---m---n-o|': sinks.ACTION}
    }, cycleRecords, done, {interval: 200});
  });
});
