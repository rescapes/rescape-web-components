import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {mergeDeep, throwing} from 'rescape-ramda';
import {eMap, loadingCompleteStatus, makeTestPropsFunction, mergeActionsForViews} from 'helpers/componentHelpers';
import {makeBrowserProportionalDimensionsSelector, makeMergeDefaultStyleWithProps} from 'selectors/styleSelectors';
import {createSelector} from 'reselect';
import {connect} from 'react-redux';
import Header from 'components/header/Header';
import {makeActiveUserRegionsAndSettingsSelector} from 'selectors/storeSelectors';
import * as R from 'ramda';

export const mapStateToProps =
  (state, props) => createSelector(
    [
      makeActiveUserRegionsAndSettingsSelector(),
      makeBrowserProportionalDimensionsSelector(),
      makeMergeDefaultStyleWithProps(),
    ],
    (data, style, browserProportionalStyle) => {
      return {
        data: R.merge(data, loadingCompleteStatus),
        style: R.merge(style, browserProportionalStyle),
      }
    }
  )(state, props);

export const mapDispatchToProps = (dispatch) => {
  return {
  };
};

// Returns a function that expects state and ownProps for testing
export const testPropsMaker = makeTestPropsFunction(mapStateToProps, mapDispatchToProps)

export default connect(mapStateToProps, mapDispatchToProps)(Header)

