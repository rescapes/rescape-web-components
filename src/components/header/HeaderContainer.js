import React, {Component} from 'react';
import {mergeDeep} from 'rescape-ramda';
import {loadingCompleteStatus, makeTestPropsFunction, mergeActionsForViews} from 'rescape-helpers-component';
import {makeMergeDefaultStyleWithProps} from 'rescape-apollo';
import {createSelector} from 'reselect';
import {connect} from 'react-redux';
import Header from 'components/header/Header';
import {makeActiveUserRegionsAndSettingsSelector} from 'rescape-apollo';
import * as R from 'ramda';

export const mapStateToProps =
  (state, props) => createSelector(
    [
      makeActiveUserRegionsAndSettingsSelector(),
      makeMergeDefaultStyleWithProps(),
    ],
    (data, style) => {
      return {
        data: R.merge(data, loadingCompleteStatus),
        style: R.merge(style, props.style)
      }
    }
  )(state, props);

export const mapDispatchToProps = (dispatch) => {
  return {
  };
};

// Returns a function that expects state and ownProps for testing
export const samplePropsMaker = makeTestPropsFunction(mapStateToProps, mapDispatchToProps)

export default connect(mapStateToProps, mapDispatchToProps)(Header)

