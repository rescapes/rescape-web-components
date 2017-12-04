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

const {createSelectorResolvedSchema} = require('./selectorResolvers');
const {sampleConfig} = require('data/samples/sampleConfig');
const {default: makeSchema} = require('./schema');
const {graphql} = require('graphql');
const R = require('ramda');
const {mapped} = require('ramda-lens');
const {activeUserSelectedRegionsSelector, regionSelector} = require('selectors/regionSelectors');
const {settingsSelector} = require('selectors/settingsSelectors');
const {activeUserSelector} = require('selectors/userSelectors');
const resolvedSchema = createSelectorResolvedSchema(makeSchema(), sampleConfig);

describe('mockExecutableSchema', () => {

  test('queryRegionsSelector', async () => {
    const query = `
        query activeUsersSelectedRegions {
            store {
                regions {
                    id
                    mapbox {
                      viewport {
                        zoom
                      }
                    }
                },
            }
        }`;

    // We expect the resolver to resolve the selected regions for the active user, not all regions
    const regionsFromSelector = activeUserSelectedRegionsSelector(sampleConfig);
    const schemaRegionLens = R.compose(R.lensPath(['data', 'store', 'regions']), mapped, R.lensProp('id'));
    // Here's what we expect back
    const expected = R.view(schemaRegionLens,
      ({
        data: {
          store: {
            regions: regionsFromSelector
          }
        }
      })
    );
    // graphql params are schema, query, rootValue, context, variables
    const regions = await graphql(resolvedSchema, query, {}, {options: {dataSource: sampleConfig}}).then(
      result => R.view(schemaRegionLens, result)
    );
    expect(regions).toEqual(expected);
  });

  test('query region', async () => {
    const query = `
        query region {
        store {
          region {
            id
            name
          },
        }
      }
    `;
    // We expect the resolver to resolve the selected regions for the active user, not all regions
    const region = R.head(R.values(sampleConfig.regions));
    const regionFromSelector = regionSelector(sampleConfig, {params: R.pick(['id'], region)});
    const schemaRegionLens = R.lensPath(['data', 'store', 'region']);
    // Here's what we expect back
    const expected =
      ({
        data: {
          store: {
            region: {
              id: region.id,
              name: region.name
            }
          }
        }
      });
    // graphql params are schema, query, rootValue, context, variables
    const result = await graphql(resolvedSchema, query, {}, {options: {dataSource: sampleConfig}}).then(
      result => R.view(schemaRegionLens, result)
    );
    expect(result).toEqual(expected);
  });
});
