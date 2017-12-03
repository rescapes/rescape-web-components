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

const {createSelector, createSelectorCreator, createStructuredSelector, defaultMemoize} = require('reselect');
const R = require('ramda');
const {mergeDeep} = require('rescape-ramda');
const {findOne, reqPath} = require('rescape-ramda').throwing;
const {geojsonByType} = require('helpers/geojsonHelpers');
const {propLensEqual} = require('./componentHelpers');
const {filterMergeByUserSettings} = require('data/userSettingsHelpers');
const {mapped} = require('ramda-lens');

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
 * Default settings selector, which passes all settings through
 * @param state
 */
const settingsSelector = module.exports.settingsSelector = state => state.settings;

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

/**
 * Map the region ids of the user to full regions
 * @param {Object} state The redux state
 * @param {Object} user The User that has regions
 */
const userRegionsSelector = module.exports.userRegionsSelector = (state, {user}) => {
 return R.map(userRegion => R.find(R.propEq('id', userRegion.id))(state.regions), user.regions)
}

/**
 * Merges the state with the user given in props to resolve the regions of the user
 * @type {function(): function(*): *}
 */
const userSelector = module.exports.userSelector = (state, {user}) => createSelector(
  [userRegionsSelector],
  regions =>
    mergeDeep(user, {
      regions
    })
)(state, {user});

/**
 * Returns the active user by searching state.users for the one and only one isActive property
 * that is true
 * @param state
 */
const activeUserSelector = module.exports.activeUserSelector = state =>
  // Explicitly pass the user in the props
  userSelector(
    state,
    {
      user: findOne(
        status[STATUS.IS_ACTIVE],
        state.users
      )
    }
  );

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
  filterMergeByUserSettings(
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
 * This selector creates a state that narrows down the state to the active user and region,
 * remove any users that are not active and any regions that are not selected.
 * Any ComponentContainer that must operate in the context of a single user and region can
 * use this selector, or more likely receive this state from their parent component.
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

/**
 * Determines the mapbox settings from the general settings.
 * TODO we could merge user overrides here in the future
 * @returns {Object} The mapbox settings
 */
module.exports.mapboxSettingsSelector = createSelector(
  [
    state => reqPath(['settings', 'mapbox'], state)
  ],
  R.identity
);

/** Selects the regions of the User
 *
 */


/**
 * For selectors that expects the state and props pre-merged.
 * Usage: (state, props) => R.compose(selector, mergeStateAndProps)(state, props)
 * This will call mergeStateAndProps with state and props and then call selector with just the merged
 * value. selectors should only take state and props separately when there is something specifically
 * different about what is expected in the state versus the props, such as for
 * makeBrowserProportionalDimensionsSelector, where the state and only the state must contain browser
 * dimenions.
 * @param state
 * @param props
 */
module.exports.mergeStateAndProps = (state, props) => mergeDeep(state, props);