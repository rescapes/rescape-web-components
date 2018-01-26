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
  asyncPropsFromSampleStateAndContainer,
} from 'rescape-helpers-component';
import headerContainer, {testPropsMaker, queries} from 'components/header/HeaderContainer';
import {testPropsMaker as appPropsMaker} from 'components/app/AppContainer';
import {eMap, withRebassProvider} from 'rescape-helpers-component';
import App, {c as cApp} from 'components/app/App';
import {c} from 'components/header/Header';
import {apolloContainerTests} from 'rescape-helpers-component';
import mockRouter from 'react-mock-router'
import * as R from 'ramda'
import {Provider as provider} from 'rebass'
import {makeSchema} from 'rescape-sample-data'
const schema = makeSchema()

// Test this container
const [HeaderContainer, MockRouter, Provider] = eMap([headerContainer, mockRouter, provider]);
const Container = R.compose(
  // Wrap a MemoryRouter since Headers have Routing Links
  c => MockRouter({initialEntries: ['/']}, c),
  HeaderContainer
)

// Find this React component
const componentName = 'Header';
// Find this class in the data renderer
const childClassDataName = c.headerLinkHolder;

const asyncParentProps = () =>
  asyncPropsFromSampleStateAndContainer(appPropsMaker, {}).then(
    appProps => {
      const appViews = App.views(appProps).views;
      const parentProps = appViews[cApp.appHeader];
      return parentProps;
    });

describe('HeaderContainer', () => apolloContainerTests({
    schema,
    Container,
    componentName,
    childClassDataName,
    testPropsMaker,
    asyncParentProps
  })
);
