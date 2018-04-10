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
import {mapDispatchToProps, mapStateToProps} from 'components/region/RegionContainer';
import {sampleInitialState} from 'helpers/helpers';
import {reqStrPathThrowing} from 'rescape-ramda';
import {samplePropsMaker as currentSamplePropsMaker} from 'components/current/CurrentContainer'
import Current, {c} from 'components/current/Current'

/**
 * @file Links sample props from a Current component to a Region component
 */

/**
 * Returns a function that expects ownProps for testing
 */
export const samplePropsMaker = makeTestPropsFunction(mapStateToProps, mapDispatchToProps);

/**
 * Returns a function that when called returns a promise of sample parentProps
 * @return {function(): Promise<any>}
 */
export const sampleAsyncParentProps = () => new Promise((resolve) => {
  const regionProps = propsFromSampleStateAndContainer(sampleInitialState, currentSamplePropsMaker, {});
  const parentProps = reqStrPathThrowing(c.currentRegion, Current.views(regionProps));
  resolve(parentProps);
});