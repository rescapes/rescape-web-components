import React from 'react';
import {connect} from 'react-redux';
import {makeMergeDefaultStyleWithProps} from 'rescape-apollo';
import * as R from 'ramda';
import Login from 'components/login/Login';
import {composeGraphqlQueryDefinitions} from 'rescape-helpers-component';

/**
 * RegionContainer expects the state to contain the active user and that user's Regions
 * It is given one of those regions as props
 * It calculates the values needed by Region's child components
 * @param {Object} state The redux state
 * @param {Object} props The parent props
 * @param {Object} props.Region The region
 */
export const mapStateToProps = (state, props) => {
  return props
};

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
const regionQuery = ` 
    query region($regionId: String!) {
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
        }
    }
`;

const signupUserMutation = `
    mutation SignupUserMutation($email: String!, $password: String!, $name: String!) {
        signupUser(
            email: $email,
            password: $password,
            name: $name
        ) {
            id
            token
        }
    }
`

const authenticateUserMutation = `
    mutation AuthenticateUserMutation($email: String!, $password: String!) {
        authenticateUser(email: {
            email: $email,
            password: $password
        }) {
            id
            token
        }
    }
`

/**
 * All queries used by the container
 * @type {{region: {query: *, args: {options: (function({data: *}): {variables: {regionId}}), props: (function({data: *, ownProps?: *}): *)}}}}
 */
export const queries = {
  // Signup the User
  mutateSignupUser: {
    query: signupUserMutation,
    args: {
      options: {
        errorPolicy: 'all'
      },
      props: ({mutate}) => ({
        signupUserMutation:
          (filterNodeCategory, filterNodeValue) => mutate({variables: {filterNodeCategory, filterNodeValue}})
      })
    }
  },
  // Authenticate the User
  mutateAuthenticateUser: {
    query: authenticateUserMutation,
    args: {
      options: {
        errorPolicy: 'all'
      },
      props: ({mutate}) => ({
        authenticateUserMutation:
          (filterNodeCategory, filterNodeValue) => mutate({variables: {filterNodeCategory, filterNodeValue}})
      })
    }
  }
};


// Create the GraphQL Container.
const ContainerWithData = composeGraphqlQueryDefinitions(queries)(Login);

// Using R.merge to ignore ownProps, which were already merged by mapStateToProps
export default connect(mapStateToProps, mapDispatchToProps, R.merge)(ContainerWithData);