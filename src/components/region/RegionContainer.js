
const {gql} = require('apollo-client-preset');
const {bindActionCreators} = require('redux');
const {connect} = require('react-redux');
const Region = require('./Region').default;
//const {actions} = require('redux/geojson/geojsonReducer');
const {mapboxSettingsSelector} = require('selectors/settingsSelectors');
const {makeMergeDefaultStyleWithProps} = require('selectors/styleSelectors');
const {makeActiveUserAndRegionStateSelector} = require('selectors/storeSelectors');
const {viewportSelector} = require('selectors/mapboxSelectors');
const {createSelector} = require('reselect');
const R = require('ramda');

const mapStateToProps = module.exports.mapStateToProps = module.exports.mapStateToProps =
  (state, {region}) => createSelector(
    [
      makeActiveUserAndRegionStateSelector(),
      makeMergeDefaultStyleWithProps(),
      mapboxSettingsSelector,
    ],
    (selectedState, style, mapboxSettings) => {
      const viewport = viewportSelector(state, {region});
      return R.mergeAll([
        selectedState,
        {style},
        {
          views: {
            // Since viewport it a Functor we map it and then merge it
            // TODO find a cleaner way to represent this
            mapbox: R.map(
              viewport => R.merge(
                mapboxSettings, {viewport}
              ),
              viewport)
          }
        }
      ]);
    }
  )(state, {region});

const mapDispatchToProps = module.exports.mapDispatchToProps = (dispatch) => {
  return {
    /*
    onRegionIsChanged: (options, bounds) => {
      dispatch({
        type: actions.FETCH_TRANSIT_DATA,
        args: [options, bounds]
      });
    }
    */
  };
};

const RegionContainer = connect(
  /**
   * The wrapped component needs access to the settings and a r
   * @param state
   * @returns {{}}
   */
  mapStateToProps, mapDispatchToProps
)(Region);

module.exports.default = RegionContainer;

