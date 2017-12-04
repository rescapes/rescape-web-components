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

const {activeUserSelector} = require('selectors/userSelectors');
const {createSelector, createStructuredSelector} = require('reselect');
const R = require('ramda');
const {mergeDeep} = require('rescape-ramda');
const {geojsonByType} = require('helpers/geojsonHelpers');
const {filterMergeByLens} = require('data/userSettingsHelpers');
const {mapped} = require('ramda-lens');
const {STATUS, status, createLengthEqualSelector} = require('./selectorHelpers');

/**
 * Resolves the openstreetmap features of a region and categorizes them by type (way, node, relation).
 * Equality is currently based on the length of the features, but we should be able to do this
 * simply by reference equality (why would the features reference change?)
 * @param {Object} state Should be the region with the
 */
const makeFeaturesByTypeSelector = module.exports.makeFeaturesByTypeSelector = () => createLengthEqualSelector(
  [
    R.view(R.lensPath(['geojson', 'osm']))
  ],
  geojsonByType
);

/**
 * Resolves the marker features of a region and categorizes them by type (way, node, relation)
 */
const makeMarkersByTypeSelector = module.exports.makeMarkersByTypeSelector = () => createLengthEqualSelector(
  [
    R.view(R.lensPath(['geojson', 'markers']))
  ],
  geojsonByType
);

/**
 * Selector for a particular region that merges in derived data structures
 * @param {Object} region A region with userSettings for that region merged in
 */
const makeRegionSelector = module.exports.makeRegionSelector = () => region => createSelector(
  [
    makeFeaturesByTypeSelector(),
    makeMarkersByTypeSelector()
  ],
  (featuresByType, locationsByType) =>
    mergeDeep(region, {
      geojson: {
        osm: {
          featuresByType,
          locationsByType
        }
      }
    })
)(region);

/**
 * Creates a selector that selects regions that are associated with this user and currently selected by this user.
 * @param {Object} state The redux state
 * @returns {Object|Array} An object keyed by region id and valued by filtered regions or
 * simply the filtered regions
 */
const makeRegionsSelector = module.exports.makeRegionsSelector = () => state => createStructuredSelector(
  filterMergeByLens(
    // Look for the regions container in the state and userSettings
    R.lensPath(['regions']),
    // Look for regions in userSettings with property isSelected
    status[STATUS.IS_SELECTED],
    // The state
    state,
    // Find the only active user.
    R.head(R.values(
      activeUserSelector(state)
    ))
  )
)(state);

/**
 * Makes a selector that expects a state containing regions, which each contain a Mapbox viewport
 * @param {Object} state The Redux state. This can be the full state or one modified for current selections
 * @param {Object} state.regions The regions object. Usually one region is expected
 * Each region contains a {mapbox: viewport: {...}}
 * @returns {Object} An object keyed by region and valued by viewport of that region's Mapbox
 */
module.exports.makeViewportsSelector = () => {
  const regionsMapboxVieportLens = R.compose(mapped, R.lensPath(['mapbox', 'viewport']));
  return createSelector(
    // Select the regions
    [makeRegionsSelector()],
    // Use the lens to extract the viewport of each region
    R.view(regionsMapboxVieportLens)
  );
};

/**
 * Makes a selector that expects a state containing regions, which each contain a geojson property
 * @param {Object} state The Redux state. This can be the full state or one modified for current selections
 * @param {Object} state.regions The regions object. Usually one region is expected
 * Each region contains a {geojson: ...}
 * @return {Object} An object keyed by region and valued by geojson
 */
const makeGeojsonSelector = module.exports.makeGeojsonsSelector = () => state => {
  const regionsGeojsonLens = R.compose(mapped, R.lensPath(['geojson']));
  return createSelector(
    [makeRegionsSelector()],
    R.view(regionsGeojsonLens)
  )(state);
};

module.exports.makeGeojsonLocationsSelector = () => state => {
  const geojsonLocationLens = R.compose(mapped, R.lensPath(['locations']));
  return createSelector(
    [makeGeojsonSelector()],
    R.view(geojsonLocationLens)
  )(state);
};
