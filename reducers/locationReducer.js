/**
 * Created by Andy Likuski on 2017.06.15
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import * as R from 'ramda'
import {actionTypeLookup} from './locationActions';

module.exports = {
  default: (state = {}, action = {}) => {
    const sortById = R.sortBy(R.prop('id'));
    const merge = R.merge(state);
    switch (action.type) {
      case actionTypeLookup.fetchLocationsRequst:
        // Indicate that the geojson has been requested so that it never tries to lad again
        // TODO use reselect in container instead of this silly state management
        return R.merge(state, {locationsRequested: true});
      case actionTypeLookup.fetchLocationsSuccess:
        // Merge the returned geojson into the state
        return merge({locations: R.map(R.prop('doc'), sortById(action.body.rows))});
      case actionTypeLookup.addLocationsSuccess:
        // Merge the returned geojson into the state
        return merge({locations: R.map(R.prop('doc'), sortById(action.body.rows))});
      case actionTypeLookup.removeLocationsSuccess:
        // Merge the returned geojson into the state
        return merge({locations: R.map(R.prop('doc'), sortById(action.body.rows))});
      default:
        return state;
    }
  }
};