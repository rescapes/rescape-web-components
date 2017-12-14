import {connect} from 'react-redux';
import Current from './Current'
import * as R from 'ramda';
import {createSelector} from 'reselect';
import { makeActiveUserAndSettingsStateSelector } from 'selectors/storeSelectors';
import {makeBrowserProportionalDimensionsSelector} from 'selectors/styleSelectors';
import {mergeDeep, throwing} from 'rescape-ramda'
import {makeTestPropsFunction, mergePropsForViews} from 'helpers/componentHelpers';
import {bindActionCreators} from 'redux';
import {activeUserRegionSelector} from 'selectors/userSelectors';

/**
 * Combined selector that:
 * Limits the state to the active user and region. This merges props with the state immediately, overriding the
 * state with anything in props.
 * It does not pass props on to sub selectors as a separate argument
 * Limits the component dimensions to the browser.
 * @param {Object} state The redux state
 * @param {Object} [props] The optional props to override the state.
 * @returns {Object} The state and own props mapped to props for the component
 */
export const mapStateToProps = (state, props) =>
  createSelector(
    [
      (state, props) => {
        return makeActiveUserAndSettingsStateSelector()(mergeDeep(state, R.defaultTo({}, props)));
      },
      makeBrowserProportionalDimensionsSelector()
    ],
    (activeUserAndSettings, style) =>
      ({
        // No current graphql queries, pass the winnowed state
        // It might turn out that Current doesn't need anything because it simply renders child containers
        // Merge the browser dimensions with the props
        // props from the parent contain style instructions
        // TODO we need to set width and height proportional to the browser dimensions, not equal to
        data: mergeDeep(activeUserAndSettings, {style}),
        views: {
          regionProps: {
            region: activeUserRegionSelector(activeUserAndSettings),
            style: {
              width: style.width,
              height: style.height
            }
          }
        }
      })
  )(state, props);

export const mapDispatchToProps = (dispatch, ownProps) => {
  return bindActionCreators({
  }, dispatch)
}

/**
 * Combines mapStateToProps, mapDispatchToProps with the given viewToActions mapping
 * @type {Function}
 */
export const mergeProps = mergePropsForViews({
  // Region child component needs the following actions
  region: []
})

// Returns a function that expects ownProps for testing
export const testPropsMaker = makeTestPropsFunction(mapStateToProps, mapDispatchToProps, mergeProps)

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Current)
