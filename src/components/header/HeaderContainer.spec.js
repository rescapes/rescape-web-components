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
} from 'helpers/testHelpers';
import headerContainer, {testPropsMaker, queries} from 'components/header/HeaderContainer';
import {testPropsMaker as appPropsMaker} from 'components/app/AppContainer';
import {eMap} from 'helpers/componentHelpers';
import App, {c as cApp} from 'components/app/App';
import {c} from 'components/header/Header';
import {apolloContainerTests} from 'helpers/apolloContainerTestHelpers';
import {MemoryRouter as memoryRouter} from 'react-router';

// Test this container
const [HeaderContainer, MemoryRouter] = eMap([headerContainer, memoryRouter]);
const Container = (...args) => MemoryRouter({initialEntries: ['/']}, HeaderContainer(args));
// Find this React component
const componentName = 'Header';
// Find this class in the data renderer
const childClassDataName = c.headerLinkHolder;
// Find this class in the loading renderer
const childClassLoadingName = c.headerLoading;
// Find this class in the error renderer
const childClassErrorName = c.headerError;

const asyncParentProps = () =>
  asyncPropsFromSampleStateAndContainer(appPropsMaker, {}).then(
    appProps => {
      const appViews = App.views(appProps).views;
      const parentProps = appViews[cApp.appHeader];
      return parentProps;
    });

describe('HeaderContainer', () => apolloContainerTests({
    Container,
    componentName,
    childClassDataName,
    // We'll probably have a loading state when the user account, etc is loading, but maybe not
    //childClassLoadingName,
    testPropsMaker,
    asyncParentProps
  })
);
