import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {withRouter} from 'react-router';
import {mergeDeep, throwing} from 'rescape-ramda';
import {eMap, makeTestPropsFunction, mergeActionsForViews} from 'helpers/componentHelpers';
import {makeMergeDefaultStyleWithProps} from 'selectors/styleSelectors';
import {createSelector} from 'reselect';
import {connect} from 'react-redux';
import Header from 'components/header/Header';
const {reqPath} = throwing;
const [div, link] = eMap(['div', Link]);

export const mapStateToProps =
  (state, props) => createSelector(
    [
      makeMergeDefaultStyleWithProps(),
    ],
    style => {
      return {
        data: mergeDeep({style}, props),
        views: {
        }
      }
    }
  )(state, props);

export const mapDispatchToProps = (dispatch) => {
  return {
  };
};

/**
 * Combines mapStateToProps, mapDispatchToProps with the given viewToActions mapping
 * @type {Function}
 */
export const mergeProps = mergeActionsForViews({
  // Region child component needs the following actions
  region: []
})

// Returns a function that expects state and ownProps for testing
export const testPropsMaker = makeTestPropsFunction(mapStateToProps, mapDispatchToProps, mergeProps)

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Header)

