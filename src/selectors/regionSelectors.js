/**
 * Created by Andy Likuski on 2017.10.17
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const {throwing: {findOne, onlyOneValue, reqPath}} = require('rescape-ramda');
const {activeUserSelector} = require('selectors/userSelectors');
const R = require('ramda');
const {STATUS: {IS_SELECTED}, status, makeMergeByLensThenFilterSelector} = require('./selectorHelpers');

/**
 * Select all regions from the state
 * @type {function(*)}
 */
module.exports.regionsSelector = state => state.regions

/**
 * Find select the region by id
 * @param state
 * @param params
 */
module.exports.regionSelector = (state, {params}) => onlyOneValue(findOne(
  region => R.propEq(reqPath(['id'], params)), state.regions)
)

/**
 * Makes a selector to select the regions of the active users
 * @param predicate Predicate to apply to each region for filtering (e.g. filter for the active region)
 * @type {function(*=): function(*=): *}
 */
const makeActiveUserRegionsSelector = (predicate) => state =>
  R.compose(
    R.values,
    state => makeMergeByLensThenFilterSelector(
      // Look for the regions container in the state and userSettings
      R.lensProp('regions'),
      R.lensPath(['user', 'regions']),
      // Look for regions in userSettings with property isSelected
      predicate
    )(
      // The state
      state,
      // Props are the active user
      {user: activeUserSelector(state)}
    )
  )(state)

module.exports.activeUserRegionsSelector = makeActiveUserRegionsSelector(R.T)

/**
 * Creates a selector that selects regions that are associated with this user and currently selected by this user.
 * @param {Object} state The redux state
 * @returns {Array} The selected regions
 */
module.exports.activeUserSelectedRegionsSelector = makeActiveUserRegionsSelector(status[IS_SELECTED])
