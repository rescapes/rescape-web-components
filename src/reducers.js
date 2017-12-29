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

import {combineReducers} from 'redux';
import {createResponsiveStateReducer} from 'redux-responsive';
import * as R from 'ramda';
import regionsReducer from 'reducers/regionsReducer';

/**
 * Combine reducers, supplying an optional mock apollo reducer for testing
 * @param {Object} [apollo] Reducer for apollow if testing a
 */
export default () => {
  return combineReducers({
    settings: R.compose(R.defaultTo({}), R.identity),
    regions:  regionsReducer,
    users: R.compose(R.defaultTo({}), R.identity),
    styles: R.compose(R.defaultTo({}), R.identity),
    browser: (state, action) => createResponsiveStateReducer(
      null,
      // Merge predefined browser values with the window object for our extraFields
      // We want to have the width and height stored in the state
      R.merge(state, {
        extraFields: () => R.ifElse(
          R.or(
            R.compose(R.isNil, R.type),
            R.complement(R.has('innerWidth'))
          ),
          R.always({}),
          w => ({
            width: w.innerWidth,
            height: w.innerHeight
          })
        )(window)
      })
    )(state, action),
  });
}