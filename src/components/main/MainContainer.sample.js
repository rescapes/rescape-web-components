/**
 * Created by Andy Likuski on 2018.03.07
 * Copyright (c) 2018 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {apolloTestPropsFunction, sampleInitialState} from 'helpers/helpers';
import {mapStateToProps, mapDispatchToProps, queries} from './MainContainer';
import {propsFromSampleStateAndContainer} from 'rescape-helpers-component';
import {reqStrPath} from 'rescape-ramda';

/**
 * Returns a function that expects state and ownProps for testing
 */
export const samplePropsMaker = apolloTestPropsFunction(mapStateToProps, mapDispatchToProps, queries.allUserRegions);

/**
 * Sample props for a view of Main
 * @param {String} viewName one of Main's views
 * @return {Promise<any>} A promise of the sample propsk
 */
export const sampleAsyncParentProps = (viewName) => () => {
  propsFromSampleStateAndContainer(sampleInitialState, samplePropsMaker, {}).then(mainProps => {
    return reqStrPath(viewName, Main.views(mainProps).views);
  });
};