/**
 * Created by Andy Likuski on 2017.12.06
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {throwing} from 'rescape-ramda';
import {createSelector} from 'reselect';
import * as R from 'ramda';
import {mapboxSettingsSelector} from 'selectors/settingsSelectors';
import {fromImmutable, toImmutable} from 'helpers/immutableHelpers';

const {reqPath} = throwing;

/**
 * Selects the viewport from the given Region's mapbox and merges it with the state's mapbox settings
 * @param {Object} state The redux State
 * @param {Object} [region] The Region Supply either this or mapbox
 * @param {Object} [mapbox] The Mapbox Supply either this or region
 * @returns A selector which extracts the viewport from the region's mapbox and merges it with the state's mapbox settings
 */
export const viewportSelector = (state, {region, mapbox}) => {
  return createSelector(
    [mapboxSettingsSelector],
    // Viewport is stored as an immutable, since react-map-gl's createViewportReducer expects it
    // If we don't need the reducer we should be able to get rid of the immutable
    mapboxSettings => R.merge(
      // Merge
      R.defaultTo({}, mapboxSettings.viewport),
      fromImmutable(
        region ?
          reqPath(['mapbox', 'viewport'], region) :
          reqPath(['viewport'], mapbox)
      )
    )
  )(state, {region});
}

