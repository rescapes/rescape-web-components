import {Component} from 'react';
import {eMap} from 'rescape-helpers-component';

const [div, h4, input] = eMap(['div', 'h4', 'input']);

export default class Logout extends Component {

  handleClick() {
    // TODO these need to be done in the Container.
    // The component shouldn't have direct knowledge of local storage or window.location
    localStorage.removeItem('token');
    window.location.replace('/');
  }

  render() {
    return (
      div({},
        h4({
            className: 'mv3'
          },
          'Logout'
        ),
        div({className: 'pointer button', onClick: () => this.handleClick()},
          'Logout'
        )
      )
    );
  }
}