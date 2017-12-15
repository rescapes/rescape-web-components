/**
 * Created by Andy Likuski on 2017.12.14
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import React, {Component} from 'react';
import {eMap} from 'helpers/componentHelpers';
import config from 'config.js';

const {settings: {graphcool: {authTokenKey, serviceIdKey}}} = config;
const [div, h4, input] = eMap(['div', 'h4', 'input']);

export default class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      login: true, // switch between Login and SignUp
      email: '',
      password: '',
      name: ''
    };
  }

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

  _confirm() {
    const {name, email, password} = this.state;
    if (this.state.login) {
      this.props.authenticateUserMutation({
        variables: {
          email,
          password
        }
      }).then(result => {
        const {id, token} = result.data.authenticateUser;
        this._saveUserData(id, token);
      });
    } else {
      this.props.signupUserMutation({
        variables: {
          name,
          email,
          password
        }
      }).then(result => {
        const {id, token} = result.data.signupUser;
        this._saveUserData(id, token);
      });
    }
    this.props.history.push(`/`);
  }

  _saveUserData(id, token) {
    localStorage.setItem(serviceIdKey, id);
    localStorage.setItem(authTokenKey, token);
  }
}
