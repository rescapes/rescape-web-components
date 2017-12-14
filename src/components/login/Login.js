import React, {Component} from 'react';
import {graphql, compose} from 'react-apollo';
import gql from 'graphql-tag';
import config from 'config.js';
import {eMap} from 'helpers/componentHelpers';

const {settings: {graphcool: {authTokenKey, serviceIdKey}}} = config;
const [div, h4, input] = eMap(['div', 'h4', 'input']);

class Login extends Component {

  state = {
    login: true, // switch between Login and SignUp
    email: '',
    password: '',
    name: ''
  };

  render() {

    return (
      div({},
        h4({
            className: 'mv3'
          },
          this.state.login ? 'Login' : 'Sign Up'
        ),
        div({
            classsName: 'flex flex-column'
          },
          !this.state.login &&
          input({
              value: this.state.name,
              onChange: (e) => this.setState({name: e.target.value}),
              type: 'text',
              placeholder: 'Your name'
            }
          ),
          input({
              value: this.state.email,
              onChange: (e) => this.setState({email: e.target.value}),
              type: 'text',
              placeholder: 'Your email addressk'
            }
          ),
          input({
              value: this.state.password,
              onChange: (e) => this.setState({password: e.target.value}),
              type: 'password',
              placeholder: 'Choose a safe password'
            }
          )
        ),
        div({className: 'flex mt3'},
          div({className: 'pointer mr2 button', onClick: () => this._confirm()},
            this.state.login ? 'login' : 'create account'
          )
        ),
        div({className: 'pointer button', onClick: () => this.setState({login: !this.state.login})},
          this.state.login ? 'login' : 'create account'
        )
      )
    );
  }

  _confirm = async () => {
    const {name, email, password} = this.state;
    if (this.state.login) {
      const result = await this.props.authenticateUserMutation({
        variables: {
          email,
          password
        }
      });
      const {id, token} = result.data.authenticateUser;
      this._saveUserData(id, token);
    } else {
      const result = await this.props.signupUserMutation({
        variables: {
          name,
          email,
          password
        }
      });
      const {id, token} = result.data.signupUser;
      this._saveUserData(id, token);
    }
    this.props.history.push(`/`);
  };

  _saveUserData = (id, token) => {
    localStorage.setItem(serviceIdKey, id);
    localStorage.setItem(authTokenKey, token);
  };

}


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