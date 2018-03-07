/**
 * Created by Andy Likuski on 2017.02.06
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import {
  apolloContainerTests, propsFromSampleStateAndContainer,
  wrapWithMockGraphqlAndStore
} from 'rescape-helpers-component';
import CurrentContainer from './CurrentContainer';
import {eMap} from 'rescape-helpers-component';
import React from 'react';
import {sampleInitialState} from 'helpers/helpers';
import {c as cMain} from 'components/main/Main';
import {c} from 'components/current/Current';
import {sampleAsyncParentProps} from 'components/main/MainContainer.sample.js'

// Test this container
const [Container] = eMap([CurrentContainer]);
// Find this React component
const componentName = 'Current';
// Find this class in the data renderer
const childClassDataName = c.current;
const initialState = sampleInitialState;
// Get sample parent props from Main for Current
const asyncParentProps = sampleAsyncParentProps(cMain.mainCurrent);

describe('CurrentContainer', () => {
  const {testMapStateToProps, testQuery, testRenderError, testRender} = apolloContainerTests({
    Container,
    componentName,
    childClassDataName,
    initialState,
    asyncParentProps
  });
  test('testMapStateToProps', testMapStateToProps);
  test('testQuery', testQuery);
  test('testRenderError', testRenderError);
  test('testRender', testRender);
});
