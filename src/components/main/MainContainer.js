import {graphql} from 'react-apollo';
import {connect} from 'react-redux';
import * as R from 'ramda';
import {makeActiveUserRegionsAndSettingsSelector} from 'rescape-apollo';
import {makeBrowserProportionalDimensionsSelector, makeMergeDefaultStyleWithProps} from 'rescape-apollo';
import {loadingCompleteStatus, makeApolloTestPropsFunction} from 'rescape-helpers-component';
import Main from 'components/main/Main';
import {gql} from 'apollo-client-preset';
import {createSelector} from 'reselect';
import {bindActionCreators} from 'redux';
import {mergeDeep} from 'rescape-ramda';

export const mapStateToProps = (state, props) => {
  const {style, ...data} = props;
  return createSelector(
    [
      makeActiveUserRegionsAndSettingsSelector(),
      makeMergeDefaultStyleWithProps(),
      makeBrowserProportionalDimensionsSelector()
    ],
    (stateData, defaultStyle, browserProportionalStyle) =>
      ({
        // No current graphql queries, pass the winnowed state
        // It might turn out that Current doesn't need anything because it simply renders child containers
        // Merge the browser dimensions with the props
        // props from the parent contain style instructions
        data: R.mergeAll([stateData, loadingCompleteStatus, data]),
        style: R.mergeAll([defaultStyle, browserProportionalStyle, style])
      })
  )(state, props);
}

export const mapDispatchToProps = (dispatch, ownProps) => {
  return bindActionCreators({}, dispatch);
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
const allUserRegionsQuery = `
    query allUserRegions($userId: String!) {
        store {
            users(id: $userId) {
                regions {
                    # Need minimum properties to let the user choose a region
                    id
                    name
                    description
                    # Is a region already selected
                    isSelected
                }
            }
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
  allUserRegions: {
    query: allUserRegionsQuery,
    args: {
      options: ({data: {user}}) => ({
        variables: {
          userId: user.id
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
  gql`${queries.allUserRegions.query}`,
  queries.allUserRegions.args)
(Main);


// Using R.merge to ignore ownProps, which were already merged by mapStateToProps
export default connect(mapStateToProps, mapDispatchToProps, R.merge)(ContainerWithData);

