import React, { Component } from 'react'
import Header from 'components/header/Header';
import Login from 'components/login/Login';
import Main from 'components/main/Main';
import { Switch, Route } from 'react-router-dom'
import {eMap} from 'helpers/componentHelpers';
const [div, header, switcher, route] = eMap(['div', Header, Switch, Route])

class App extends Component {
  render() {
    return (
      div({},
        header(),
        div({},
          switcher({}, [
            route({exact: true, path:'/', component:Main}),
            route({exact: true, path:'/login', component:Login}),
          ]))
        )
    )
  }
}

export default App