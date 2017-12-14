import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import App from 'components/app'
import registerServiceWorker from './registerServiceWorker'
import { BrowserRouter } from 'react-router-dom'
import { ApolloProvider } from 'react-apollo'
import createClient from './apolloClient'
import storeCreator from './store'
import {getCurrentConfig} from 'data/current/currentConfig';
import {eMap} from 'helpers/componentHelpers';
const [browserRouter, apolloProvider, app] = eMap([BrowserRouter, ApolloProvider, App])

// Create a store based on the configured environent (development, production, test)
const store = storeCreator(getCurrentConfig())

const client = createClient()
// Render the React components
// BrowserRouter routes anything defined in a child component Switch
// ApolloProvider wraps our components with the ApolloClient so we can access GraphQL data from anywhere
// 'root' is the id of the <div> defined in index.html
ReactDOM.render(
  browserRouter({},
    apolloProvider({store, client},
      app()
    )
  ), document.getElementById('root'))
registerServiceWorker()