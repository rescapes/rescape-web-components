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

const {settingsSelector} = require('selectors/settingsSelectors');
const {makeRegionsSelector} = require('selectors/regionSelectors');
const {activeUserSelector} = require('selectors/userSelectors');

const {createStructuredSelector} = require('reselect');

/**
 * This selector creates a state that narrows down the state to the active user and region,
 * remove any users that are not active and any regions that are not selected.
 * Any ComponentContainer that must operate in the context of a single user and region can
 * use this selector, or more likely receive this state = their parent component.
 * @returns {Function} A reselect selector that is called with state and props and returns
 * an object containing settings, regions, and users, where regions and users must limited to
 * one each
 */
module.exports.makeActiveUserAndRegionStateSelector = () =>
  createStructuredSelector({
    settings: settingsSelector,
    regions: makeRegionsSelector(),
    users: activeUserSelector
  });
