import {connect} from 'react-redux';
import {makeMergeDefaultStyleWithProps} from 'selectors/styleSelectors';
import {gql} from 'apollo-client-preset';
import {graphql} from 'react-apollo';
import {
  makeApolloTestPropsFunction,
  makeTestPropsFunction
} from 'helpers/componentHelpers';
import {mergeDeep, throwing} from 'rescape-ramda';
import React from 'react';
import * as R from 'ramda';
import {createSelector} from 'reselect';
import Region from './Region';

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
      // State and props merged style
      makeMergeDefaultStyleWithProps()
    ],
    // Replace props.style with style
    style => R.merge(props, {style})
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
  /**
   * Expect a region stub with an id and resolves the full region from the data layer
   */
  region: {
    query: regionQuery,
    args: {
      options: ({data: {region}}) => ({
        variables: {
          regionId: region.id
        }
      }),
      props: ({data, ownProps}) => mergeDeep(
        ownProps,
        {data}
      )
    }
  }
};

// Create the GraphQL Container.
// TODO We should handle all queries in queries here
const ContainerWithData = graphql(
  queries.region.query,
  queries.region.args)
(Region);

/**
 * Combines mapStateToProps and mapDispatchToProps, but not ownProps, which were already merged
 * @type {Function}
 */
export const mergeProps = R.merge

// Returns a function that expects state and ownProps for testing
export const testPropsMaker = makeApolloTestPropsFunction(mapStateToProps, mapDispatchToProps, mergeProps)(queries.region)


export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ContainerWithData);

