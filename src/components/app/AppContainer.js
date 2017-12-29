import {gql} from 'apollo-client-preset';
import {graphql} from 'react-apollo';
import {connect} from 'react-redux';
import App from 'components/app/App';
import * as R from 'ramda';
import {createSelector} from 'reselect';
import {makeActiveUserRegionsAndSettingsSelector} from 'selectors/storeSelectors';
import {makeBrowserProportionalDimensionsSelector} from 'selectors/styleSelectors';
import {mergeDeep} from 'rescape-ramda';
import {makeApolloTestPropsFunction} from 'helpers/componentHelpers';


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
export const mapStateToProps = (state, props) => {
  const {style, ...data} = props;
  return createSelector(
    [
      (state, props) => {
        return makeActiveUserRegionsAndSettingsSelector()(mergeDeep(state, R.defaultTo({}, props)));
      },
      makeBrowserProportionalDimensionsSelector()
    ],
    (activeUserAndRegion, dimensions) => ({
      data: R.merge(activeUserAndRegion, data),
      // Merge the browser dimensions with the props
      // props from the parent contain style instructions
      // TODO we need to set width and height proportional to the browser dimensions, not equal to
      style: R.merge(dimensions, style)
    })
  )(state, props);
}

export const mapDispatchToProps = (dispatch) => {
  return {
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
const userRegionsQuery = `
    query userRegions($userId: String!) {
        store {
            users(id: $userId) {
                regions {
                    id,
                    name,
                    description,
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
  userRegions: {
    query: userRegionsQuery,
    args: {
      options: ({data: {user}}) => ({
        variables: {
          userId: user.id
        },
        // Pass through error so we can handle it in the component
        errorPolicy: 'none'
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
  gql`${queries.userRegions.query}`,
  queries.userRegions.args)(App)

// Returns a function that expects state and ownProps for testing
export const testPropsMaker = makeApolloTestPropsFunction(mapStateToProps, mapDispatchToProps, queries.userRegions);

// Using R.merge to ignore ownProps, which were already merged by mapStateToProps
export default connect(mapStateToProps, mapDispatchToProps, R.merge)(ContainerWithData);
