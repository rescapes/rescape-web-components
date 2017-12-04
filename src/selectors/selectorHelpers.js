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

const {createSelectorCreator, defaultMemoize} = require('reselect');
const R = require('ramda');
const {mergeDeep} = require('rescape-ramda');
const {propLensEqual} = require('helpers/componentHelpers');

/**
 * Creates a reselect selector creator that compares the length of values of the
 * selected object from one call to the next to determine equality instead of doing and equals check.
 * This is used for large datasets like geojson features where we assume no change unless the list size changes
 */
const createLengthEqualSelector = module.exports.createLengthEqualSelector =
  // Use propLensEqual as the equality check to defaultMemoize
  createSelectorCreator(
    defaultMemoize,
    propLensEqual(R.lensProp('length'))
  );

/**
 * Object statuses
 * @type {{IS_SELECTED: string, IS_ACTIVE: string}}
 */
const STATUS = module.exports.STATUS = {
  IS_SELECTED: 'isSelected',
  IS_ACTIVE: 'isActive'
};

/**
 * Object to lookup the a particular status
 * @type {{}}
 */
const status = module.exports.status = R.fromPairs(
  R.map(
    status => [status, R.prop(status)],
    [STATUS.IS_SELECTED, STATUS.IS_ACTIVE]
  )
);

module.exports.mergeStateAndProps = (state, props) => mergeDeep(state, props);