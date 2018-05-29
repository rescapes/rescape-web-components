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

import {apolloTestPropsTaskMaker, sampleInitialState} from 'helpers/helpers';
import {mapStateToProps, mapDispatchToProps, queries} from './AppContainer';

/**
 * @file Links sample props from a Current component to a Region component
 */

/**
 * Returns a function that expects state and parentProps for testing and returns a Task that resolves the props
 */
export const samplePropsTaskMaker = apolloTestPropsTaskMaker(mapStateToProps, mapDispatchToProps, queries.allUserRegions);

/**
 * Sample chained props for a view of App Container. Since this is the top-level there is nothing to chain
 * @param {String} viewName one of Region's views
 * @return {Task} A Task that resolves the parent container/component props and uses them to form this container's props
 */
export const chainedSamplePropsTask = samplePropsTaskMaker(sampleInitialState, {});
