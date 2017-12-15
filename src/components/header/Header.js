import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {withRouter} from 'react-router';
import {throwing} from 'rescape-ramda';
import {eMap} from 'helpers/componentHelpers';
const {reqPath} = throwing;
const [div, link] = eMap(['div', Link]);

class Header extends Component {

  render(props) {
    const {userIdKey, userAuthTokenKey} = reqPath(['settings', 'graphcool'], props);
    const userId = localStorage.getItem(userIdKey);
    return (
      div({className: 'flex pa1 justify-between nowrap orange'},
        div({className: 'flex flex-fixed black'},
          div({className: 'fw7 mr1'}, 'Urbinsight'),
          link({to: '/', className: 'ml1 no-underline black'}, 'New'),
          div({className: 'm1'}, '|'),
          link({to: '/top', className: 'ml1 no-underline black'}, 'Top'),
          div({className: 'm1'}, '|'),
          link({to: '/search', className: 'ml1 no-underline black'}, 'Saerch')
        )
      )
    )
  }
}
export default withRouter(Header)

