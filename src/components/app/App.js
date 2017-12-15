import React, { Component } from 'react'
import Login from 'components/login/LoginContainer';
import Main from 'components/main/Main';
import { Switch, Route } from 'react-router-dom'
import {eMap} from 'helpers/componentHelpers';
import HeaderContainer from 'components/header/HeaderContainer';
const [div, header, switcher, route] = eMap(['div', HeaderContainer, Switch, Route])

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