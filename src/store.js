/**
 * Created by Andy Likuski on 2017.11.29
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import thunk from 'redux-thunk';
import {createLogger} from 'redux-logger';
import {applyMiddleware, compose, createStore} from 'redux';
import rootReducer from 'reducers';
import createInitialState from './initialState';
import {composeWithDevTools} from 'redux-devtools-extension';
import createDebounce from 'redux-debounced';

const loggerMiddleware = createLogger();

/**
 * Creates a store
 * @param {Object} config The config object to use for the initialState
 * @param {Object} [testEnhancers] Optional enhancers to override default enhancers for testing
 * @returns {Object} The redux store
 */
export default (config, testEnhancers = []) => {
  // compose enhancers unless supplied.
  // this prevents running Apollo's client.middleware() in node tests
  const composedEnhancers = testEnhancers.length ?
    compose(...testEnhancers) :
    composeWithDevTools(applyMiddleware(createDebounce(), thunk, loggerMiddleware))

  return createStore(
    rootReducer(),
    createInitialState(config),
    composedEnhancers
  );
}