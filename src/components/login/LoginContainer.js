import React from 'react';
import {graphql, compose} from 'react-apollo';
import gql from 'graphql-tag';
import Login from 'components/login/Login';

const SIGNUP_USER_MUTATION = gql`
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
`;

const AUTHENTICATE_USER_MUTATION = gql`
    mutation AuthenticateUserMutation($email: String!, $password: String!) {
        authenticateUser(email: {
            email: $email,
            password: $password
        }) {
            id
            token
        }
    }
`;

export default compose(
  graphql(SIGNUP_USER_MUTATION, {name: 'signupUserMutation'}),
  graphql(AUTHENTICATE_USER_MUTATION, {name: 'authenticateUserMutation'})
)(Login);