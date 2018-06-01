/**
 * Created by Andy Likuski on 2018.01.17
 * Copyright (c) 2018 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {createSampleConfig, getCurrentConfig} from 'rescape-sample-data';
import makeSchema from 'schema/schema';
import {
  makeApolloTestPropsTaskFunction, makeSampleInitialState,
  propsFromSampleStateAndContainer,
  makeTestPropsFunction
} from 'rescape-helpers-component';
import {createSelectorResolvedSchema} from 'schema/selectorResolvers';
import createInitialState from 'initialState';
import {promiseToTask, taskToPromise, reqPathThrowing} from 'rescape-ramda';
import {of} from 'folktale/concurrency/task';
import PropTypes from 'prop-types';
import {v} from 'rescape-validate';
import * as Either from 'data.either';

/**
 *
 * These helpers are trivial functions that use rescape-sample-data and rescape-helpers-component togther,
 * creating functions that are seeded with sample data for testing
 */

const sampleConfig = createSampleConfig();
/**
 * Sample initial state for tests
 */
export const sampleInitialState = makeSampleInitialState(createInitialState, sampleConfig);

/**
 * Resolved schema for tests
 * @type {Object}
 */
export const resolvedSchema = createSelectorResolvedSchema(makeSchema(), getCurrentConfig());

/**
 * Calls makenApolloTestPropsFunction with the given * 3 arguments:
 * mapStateToProps, mapDispatchToProps, {query, args}
 * See makeApolloTestPropsFunction for details.
 * The resulting promise is wrapped in a Task.
 * @param {Function} mapStateToProps
 * @param {Function} mapDispatchToProps
 * @param {Object} queryInfo
 * @returns {Function} A 2 arity function called with state and props that results in a Task that
 * resolves the props as A Right if no errors and a Left if errors
 */
export const apolloTestPropsTaskMaker = v((mapStateToProps, mapDispatchToProps, queryInfo) =>
    (state, props) => makeApolloTestPropsTaskFunction(resolvedSchema, sampleConfig, mapStateToProps, mapDispatchToProps, queryInfo)(state, props)
  , [
    ['mapStateToProps', PropTypes.func.isRequired],
    ['mapDispatchToProps', PropTypes.func.isRequired],
    ['queryInfo', PropTypes.shape().isRequired]
  ], 'apolloTestPropsTaskMaker');

/**
 * Calls makeTestPropsFunction on a non Apollo container. This is a synchronous but wrapped in a
 * Task to match calls to apolloTestPropsTaskMaker
 * @param mapStateToProps
 * @param mapDispatchToProps
 * @return {Function} A 2 arity function called with state and props that results in a Task that
 * resolves the props
 */
export const testPropsTaskMaker = (mapStateToProps, mapDispatchToProps) =>
  // Wrap function result in a Task to match apolloTestPropsTaskMaker
  (state, props) => of(Either.Right(makeTestPropsFunction(mapStateToProps, mapDispatchToProps)(state, props)));

/**
 * Given a Task to fetch parent container props and a task to fetch the current container props,
 * Fetches the parent props and then samplePropsTaskMaker with the initial state and parent props
 * @param {Task} parentContainerSamplePropsTask Task that resolves to the parent container props
 * @param {Function} samplePropsTaskMaker 2 arity function expecting state and parent props.
 * Returns a Task from a container that expects a sample state and sampleOwnProps
 * and then applies the container's mapStateToProps, mapDispatchToProps, and optional mergeProps
 * @param parentComponentViews
 * @param viewName
 * @returns {Task} A Task to asynchronously return the parentContainer props merged with sampleOwnProps
 * in an Either.Right. If anything goes wrong an Either.Left is returned
 */
export const asyncParentPropsTask = v((parentContainerSamplePropsTask, samplePropsTaskMaker, parentComponentViews, viewName) =>
    parentContainerSamplePropsTask.map(
      // the parent props to the props of the desired view in an Either.Right
      propsEither => propsEither.map(props => reqPathThrowing(['views', viewName], parentComponentViews(props)))
    ).chain(parentContainerSamplePropsEither => parentContainerSamplePropsEither
      // Chain the Either.Right value to a Task combine the parent props with the props maker
        .chain(parentContainerSampleProps => samplePropsTaskMaker(sampleInitialState, parentContainerSampleProps))
    ).map(value => value),
  [
    ['parentContainerSamplePropsTask', PropTypes.shape().isRequired],
    ['samplePropsTaskMaker', PropTypes.func.isRequired],
    ['parentComponentViews', PropTypes.func.isRequired],
    ['viewName', PropTypes.string.isRequired]
  ],
  'asyncParentPropsTask');


