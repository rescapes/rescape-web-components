import {connect} from 'react-redux';
import Region, {c} from './Region';
import {makeMergeDefaultStyleWithProps} from 'selectors/styleSelectors';
import {gql} from 'apollo-client-preset';
import {graphql} from 'react-apollo';
import {
  makeTestPropsFunction,
  mergeActionsForViews, resolveApolloProps
} from 'helpers/componentHelpers';
import {mergeDeep, throwing} from 'rescape-ramda';
import React from 'react';
import * as R from 'ramda';
import {createSelector} from 'reselect';

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
      makeMergeDefaultStyleWithProps()
    ],
    style => {
      return {
        // Initiate data from props and default style
        data: R.omit(['style'], props),
        // State and props merged style
        style
      };
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


/**
 * Query
 * Prerequisites:
 *   A User in context
 * Resolves:
 *  The Regions of the User
 * Without prerequisites:
 *  Skip render
 */
const regionQuery = gql`
    query region($regionId: String!) {
        store {
            region(id: $regionId) {
                id
                name
            },
        }
    }
`;


/**
 * All queries used by the container
 * @type {{region: {query: *, args: {options: (function({data: *}): {variables: {regionId}}), props: (function({data: *, ownProps?: *}): *)}}}}
 */
export const queries = {
  region: {
    query: regionQuery,
    args: {
      options: ({data: {region}}) => ({
        variables: {
          regionId: region.id
        }
      }),
      props: props => resolveApolloProps({
        // region is expected from the query result
        [c.regionMapboxProps]: ['store.region']
      }, props)
    }
  }
};

const ContainerWithData = graphql(queries.region.query, queries.region.args)(Region);

/**
 * Combines mapStateToProps, mapDispatchToProps with the given viewToActions mapping
 * @type {Function}
 */
export const mergeProps = mergeActionsForViews({
  // Region child component needs the following actions
  [c.regionMapboxProps]: []
});

// Returns a function that expects state and ownProps for testing
export const testPropsMaker = makeTestPropsFunction(mapStateToProps, mapDispatchToProps, mergeProps);

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ContainerWithData);

