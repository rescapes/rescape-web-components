
import {connect} from 'react-redux';
import Region from './Region'
import {makeMergeDefaultStyleWithProps} from 'selectors/styleSelectors';
import {createSelector} from 'reselect';
import * as R from 'ramda';
import {gql} from 'apollo-client-preset';
import {graphql} from 'react-apollo';

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


/**
 * Query
 * Prerequisites:
 *   A User in context
 * Resolves:
 *  The Regions of the User
 * Without prerequisites:
 *  Skip render
 */
const query = gql`
    query region($regionId: String!) {
        store {
            region(id: $id) {
                id
                name
            },
        }
    }
`;

const ContainerWithData = graphql(query, {
  options: ({region}) => ({
    variables: {
      regionId: region.id
    }
  }),
  props: ({data}) => ({
    store: data.store,
    loading: data.loading,
    data
  })
})
(Region);

const RegionContainer = connect(
  /**
   * The wrapped component needs access to the settings and a r
   * @param state
   * @returns {{}}
   */
  mapStateToProps, mapDispatchToProps
)(ContainerWithData);

export default RegionContainer;

