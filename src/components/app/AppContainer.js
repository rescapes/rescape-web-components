import {gql} from 'apollo-client-preset';
import {graphql} from 'react-apollo';
import {connect} from 'react-redux';
import App from 'components/app/App';
import * as R from 'ramda';
import {createSelector} from 'reselect';
import {makeActiveUserRegionsAndSettingsSelector} from 'rescape-apollo';
import {makeBrowserProportionalDimensionsSelector} from 'rescape-apollo';
import {mergeDeep} from 'rescape-ramda';
import PropTypes from 'prop-types'
import {v} from 'rescape-validate'
import {composeGraphqlQueryDefinitions} from 'helpers/testHelpers';
import Login from 'components/login/Login';

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
export const mapStateToProps = v((state, props) => {
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
      style: R.merge(dimensions, style)
    })
  )(state, props);
},
  [
    ['state', PropTypes.shape().isRequired],
    ['props', PropTypes.shape({
      style: PropTypes.shape()
    })],
  ],
  'mapStateToProps');

export const mapDispatchToProps = (dispatch) => {
  return {

  }
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
            user(id: $userId) {
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
        errorPolicy: 'all'
      }),
      props: ({data, ownProps}) => mergeDeep(
        ownProps,
        {data}
      )
    }
  }
};

// Create the GraphQL Container.
const ContainerWithData = composeGraphqlQueryDefinitions(queries)(App);

// Using R.merge to ignore ownProps, which were already merged by mapStateToProps
export default connect(mapStateToProps, mapDispatchToProps, R.merge)(ContainerWithData);
