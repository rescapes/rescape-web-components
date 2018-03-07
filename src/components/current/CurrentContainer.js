import {connect} from 'react-redux';
import Current from './Current';
import * as R from 'ramda';
import {createSelector} from 'reselect';
import {
  makeActiveUserSelectedRegionAndSettingsSelector,
} from 'selectors/storeSelectors';
import {makeBrowserProportionalDimensionsSelector, makeMergeDefaultStyleWithProps} from 'selectors/styleSelectors';
import {mergeDeep} from 'rescape-ramda';
import {loadingCompleteStatus, makeTestPropsFunction} from 'rescape-helpers-component';
import {bindActionCreators} from 'redux';

/**
 * Combined selector that:
 * Selects the active user and user's selected region.
 * Merges the component dimensions to the browser with the default styles.
 * @param {Object} state The redux state
 * @param {Object} [props] The optional props to override the state.
 * @returns {Object} The state and own props mapped to props for the component
 */
export const mapStateToProps = (state, props) => {
  const {style, ...data} = props
  return createSelector(
    [
      makeActiveUserSelectedRegionAndSettingsSelector(),
      makeMergeDefaultStyleWithProps(),
      makeBrowserProportionalDimensionsSelector()
    ],
    (stateData, defaultStyle, browserProportionalStyle) => ({
      // No current graphql queries, pass the winnowed state
      // It might turn out that Current doesn't need anything because it simply renders child containers
      // Merge the browser dimensions with the props
      // props from the parent contain style instructions
      // TODO we need to set width and height proportional to the browser dimensions, not equal to
      data: R.mergeAll([stateData, loadingCompleteStatus, data]),
      style: R.mergeAll([defaultStyle, browserProportionalStyle, style])
    })
  )(state, props);
}

export const mapDispatchToProps = (dispatch, ownProps) => {
  return bindActionCreators({}, dispatch);
};



export default connect(mapStateToProps, mapDispatchToProps)(Current);
