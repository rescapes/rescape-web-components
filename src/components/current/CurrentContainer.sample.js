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

import {makeTestPropsFunction, propsFromSampleStateAndContainer} from 'rescape-helpers-component';
import {mapDispatchToProps, mapStateToProps} from 'components/current/CurrentContainer';
import {sampleInitialState} from 'helpers/helpers';
import Current, {c} from './Current';
import {reqStrPathThrowing} from 'rescape-ramda';

/**
 * Returns a function that expects ownProps for testing
 */
export const samplePropsMaker = makeTestPropsFunction(mapStateToProps, mapDispatchToProps);

/**
 * Returns a function that when called returns a promise of sample parentProps
 * @param {String} viewName The view of the parent component representing the child Component whose props are sought
 * @return {function(): Promise<any>}
 */
export const sampleAsyncParentProps = (viewName) => () => new Promise((resolve) => {
  const currentProps = propsFromSampleStateAndContainer(sampleInitialState, samplePropsMaker, {});
  const parentProps = reqStrPathThrowing(viewName, Current.views(currentProps).views);
  resolve(parentProps);
});