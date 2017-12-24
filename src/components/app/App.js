import React, { Component } from 'react'
import Login from 'components/login/LoginContainer';
import Main from 'components/main/MainContainer';
import { Switch as switchy, Route as route } from 'react-router-dom'
import {eMap} from 'helpers/componentHelpers';
import header from 'components/header/HeaderContainer';
const [Div, Header, Switch, Route] = eMap(['div', header, switchy, route])

class App extends Component {
  render() {
    return (
      Div({},
        Header(),
        Div({},
          Switch({}, [
            Route({key:'/', exact: true, path:'/', component: Main}),
            Route({key:'/login', exact: true, path:'/login', component: Login}),
          ]))
        )
    )
  }
}

export default App