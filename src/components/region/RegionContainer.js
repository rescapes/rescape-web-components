
import {connect} from 'react-redux';
import Region from './Region'
import {mapboxSettingsSelector} from 'selectors/settingsSelectors';
import {makeMergeDefaultStyleWithProps} from 'selectors/styleSelectors';
import {makeActiveUserAndRegionStateSelector} from 'selectors/storeSelectors';
import {viewportSelector} from 'selectors/mapboxSelectors';
import {createSelector} from 'reselect';
import * as R from 'ramda';

export const mapStateToProps =
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
            mapbox: {
              viewport: R.merge(
                mapboxSettings,
                {viewport}
              )
            }
          }
        }
      ]);
    }
  )(state, {region});

export const mapDispatchToProps = (dispatch) => {
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

export default RegionContainer;

