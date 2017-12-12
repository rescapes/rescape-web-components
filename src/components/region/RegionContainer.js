
import {connect} from 'react-redux';
import Region from './Region'
import {mapboxSettingsSelector} from 'selectors/settingsSelectors';
import {makeMergeDefaultStyleWithProps} from 'selectors/styleSelectors';
import {makeActiveUserAndRegionStateSelector} from 'selectors/storeSelectors';
import {viewportSelector} from 'selectors/mapboxSelectors';
import {createSelector} from 'reselect';
import * as R from 'ramda';

/**
 * RegionContainer expects the state to contain the active user and that user's Regions
 * It is given one of those regions as props
 * It calculates the values needed by Region's child components
 * @param {Object} state The redux state
 * @param {Object} props The parent props
 * @param {Object} props.Region The region
 */
export const mapStateToProps =
  (state, props) => createSelector(
    [
      makeMergeDefaultStyleWithProps(),
    ],
    style => {
      return R.mergeAll([
        props,
        {style},
      ]);
    }
  )(state, props);

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

