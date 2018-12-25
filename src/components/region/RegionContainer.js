import {connect} from 'react-redux';
import {makeMergeDefaultStyleWithProps} from 'rescape-apollo';
import {gql} from 'apollo-client-preset';
import {graphql} from 'react-apollo';
import {mergeDeep} from 'rescape-ramda';
import * as R from 'ramda';
import {createSelector} from 'reselect';
import Region from './Region';
import {composeGraphqlQueryDefinitions} from 'helpers/testHelpers';

/**
 * RegionContainer expects the state to contain the active user and that user's Regions
 * It is given one of those regions as props
 * It calculates the values needed by Region's child components
 * @param {Object} state The redux state
 * @param {Object} props The parent props
 * @param {Object} props.Region The region
 */
export const mapStateToProps = (state, props) => {
  const {style, ...data} = props;
  return createSelector(
    [
      // State and props merged style
      makeMergeDefaultStyleWithProps()
    ],
    // Replace props.style with style
    defaultStyle => ({
      data,
      style: R.merge(defaultStyle, style)
    })
  )(state, props);
};

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
const regionQuery = ` 
    query region($regionId: String!) {
        store {
            region(id: $regionId) {
                id
                name
                mapbox {
                  viewport {
                    latitude
                    longitude
                    zoom
                  }
                }
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
        },
        // Pass through error so we can handle it in the component
        errorPolicy: 'all'
      }),
      props: ({data, ownProps}) => {
        return mergeDeep(
          ownProps,
          {data}
        )
      }
    }
  }
};

// Create the GraphQL Container.
const ContainerWithData = composeGraphqlQueryDefinitions(queries)(Region);


// Using R.merge to ignore ownProps, which were already merged by mapStateToProps
export default connect(mapStateToProps, mapDispatchToProps, R.merge)(ContainerWithData);

