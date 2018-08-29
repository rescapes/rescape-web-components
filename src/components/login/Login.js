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
import {Component} from 'react';
import {eMap} from 'rescape-helpers-component';
import config from 'config.js';

const {settings: {api: {authTokenKey}}} = config;
const [div, h4, input, form, button] = eMap(['div', 'h4', 'input', 'form', 'button']);

export default class Login extends Component {

  /**
   * Handle the form submission
   * @param e
   */
  handleSubmit(e) {
    e.preventDefault();
    let data = new FormData(this.form);
    // TODO move to Mutation in the container
    fetch('http://localhost:8000/api-token-auth/', {
      method: 'POST',
      body: data
    })
      .then(res => {
        res.json().then(res => {
          if (res.token) {
            // TODO these also need to be part of the container, obviously
            localStorage.setItem('authTokenKey', res.token);
            window.location.replace('/');
          }
        });
      })
      .catch(err => {
        console.log('Network error');
      });
  }

  /**
   * Presents a sign up or login form
   */
  render() {
    return (
      div({},
        h4({
            className: 'mv3'
          },
          this.state.login ? 'Login' : 'Sign Up'
        ),
        form({
            ref: ref => (this.form = ref),
            onSubmit: e => this.handleSubmit(e),
            classsName: 'flex flex-column'
          },
          input({
              value: this.state.email,
              type: 'text',
              placeholder: 'Your email address'
            }
          ),
          input({
              value: this.state.password,
              type: 'password',
              placeholder: 'Choose a safe password'
            }
          ),
          button({className: 'flex mt3'}, 'Login')
          /*
          div({className: 'flex mt3'},
            div({className: 'pointer mr2 button'},
              'login'
            )
          ),
          div({className: 'pointer button'},
            'login'
          )
          */
        )
      )
    );
  }
}
