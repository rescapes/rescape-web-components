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

import headerContainer, {queries} from 'components/header/HeaderContainer';
import {eMap, withRebassProvider} from 'rescape-helpers-component';
import {c} from 'components/header/Header';
import {apolloContainerTests} from 'rescape-helpers-component';
import mockRouter from 'react-mock-router';
import * as R from 'ramda';
import {Provider as provider} from 'rebass';
import {createSchema} from 'rescape-sample-data'
import {sampleInitialState} from '../../helpers/testHelpers';
import {chainedParentPropsTask} from 'components/header/HeaderContainer.sample';
import {mapStateToProps} from 'components/header/HeaderContainer';

const schema = createSchema();

// Test this container
const [HeaderContainer, MockRouter, Provider] = eMap([headerContainer, mockRouter, provider]);
const Container = R.compose(
  // Wrap a MemoryRouter since Headers have Routing Links
  c => MockRouter({initialEntries: ['/']}, c),
  HeaderContainer
);

// Find this React component
const componentName = 'Header';
// Find this class in the data renderer
const childClassDataName = c.headerLinkHolder;

const {testMapStateToProps, testRenderError, testRender} = apolloContainerTests({
  initialState: sampleInitialState,
  schema,
  Container,
  componentName,
  childClassDataName,
  chainedParentPropsTask,
  mapStateToProps,
});

test('testMapStateToProps', testMapStateToProps);
test('testRender', testRender);
