import React, { Component } from 'react'
import Header from 'components/header/Header';
import Login from 'components/login/Login';
import Main from 'components/main/Main';
import { Switch, Route } from 'react-router-dom'

class App extends Component {
  render() {
    return (
      <div>
        <Header />
        <div>
          <Switch>
            <Route exact path='/' coponent={Main}/>
            <Route exact path='/login' component={Login}/>
          </Switch>
        </div>
      </div>
    )
  }
}

export default App