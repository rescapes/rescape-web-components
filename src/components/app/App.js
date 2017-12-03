import React, { Component } from 'react'
import LinkList from './LinkList'
import Header from './Header'
import Login from './Login'
import Search from './Search'
import { Switch, Route, Redirect } from 'react-router-dom'

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