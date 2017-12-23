import React, { Component } from 'react'
import Login from 'components/login/LoginContainer';
import Main from 'components/main/Main';
import { Switch, Route } from 'react-router-dom'
import {eMap} from 'helpers/componentHelpers';
import header from 'components/header/HeaderContainer';
const [Div, Header, Switchy, Routey] = eMap(['div', header, Switch, Route])

class App extends Component {
  render() {
    return (
      Div({},
        Header(),
        Div({},
          Switchy({}, [
            Routey({key:'/', exact: true, path:'/', component:Main}),
            Routey({key:'/login', exact: true, path:'/login', component:Login}),
          ]))
        )
    )
  }
}

export default App