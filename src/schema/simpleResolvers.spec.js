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

import {createSimpleResolvedSchema, createSelectorResolvedSchema} from './simpleResolvers';
import {sampleConfig} from 'rescape-sample-data'
import makeSchema from './schema';
import {graphql} from 'graphql';
import * as R from 'ramda';
import {makeRegionsSelector} from 'selectors/selectorHelpers';
import {mapped} from 'ramda-lens'

describe('mockExecutableSchema', () => {
  test('createSimpleResolvedSchema', async () => {
    const resolvedSchema = createSimpleResolvedSchema(makeSchema(), sampleConfig);
    expect(resolvedSchema).toMatchSnapshot();
    const query = `
        query allRegions {
            store {
                regions {
                    id
                },
            }
        }
    `;

    const schemaRegionLens = R.compose(R.lensPath(['data', 'store', 'regions'], mapped, R.lensProp('id')))
    const sampleRegionLens = R.compose(R.lensPath(['regions'], mapped, R.lensProp('id')))
    const regions = await graphql(resolvedSchema, query).then(
      result =>
        R.view(schemaRegionLens, result)
    )
    expect(regions).toEqual(
      R.view(sampleRegionLens, sampleConfig)
    );
  });
});
