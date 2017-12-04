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

const {createSelector} = require('reselect');
const R = require('ramda');
const {mergeDeep, throwing: {findOne, reqPath}} = require('rescape-ramda');
const {STATUS, status} = require('./selectorHelpers');

/**
 * Map the region ids of the user to full regions
 * @param {Object} state The redux state
 * @param {Object} user The User that has regions
 */
const userRegionsSelector = module.exports.userRegionsSelector = (state, {user}) =>
{
  return R.map(
    userRegion => R.find(R.propEq('id', userRegion.id))(R.values(state.regions)),
    R.values(user.regions)
  );
};

/**
 * Returns the active user by searching state.users for the one and only one isActive property
 * that is true
 * @param state
 */
const activeUserSelector = module.exports.activeUserSelector = state =>
  findOne(
    status[STATUS.IS_ACTIVE],
    reqPath(['users'], state)
  );
