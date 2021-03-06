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

import {mapDispatchToProps, mapStateToProps} from 'components/current/CurrentContainer';
import {localPropsFromParentPropsHelperTask} from '../../helpers/testHelpers';
import {chainedSamplePropsTask as parentContainerSamplePropsTask} from 'components/app/AppContainer.sample';
import Parent, {c as parentC} from 'components/app/App'
import {parentPropsForContainerTask, testPropsTaskMaker} from 'rescape-helpers-test'

/**
 * @file Links sample props from a App component to a Header component
 */

/**
 * Returns a function that expects state and parentProps for testing and returns a Task that resolves the props
 */
export const samplePropsTaskMaker = testPropsTaskMaker(mapStateToProps, mapDispatchToProps);

/**
 * Task returning sample parent props from all the way up the view hierarchy
 */
export const chainedParentPropsTask = parentPropsForContainerTask(parentContainerSamplePropsTask,  Parent.views, parentC.appHeader);

/**
 * Task returning sample props from all the way up the view hierarchy
 */
export const chainedSamplePropsTask = localPropsFromParentPropsHelperTask(chainedParentPropsTask, samplePropsTaskMaker);