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

// Create a store based on the configured environent (development, production, test)
const store = storeCreator(getCurrentConfig())

// Render the React components
// BrowserRouter routes anything defined in a child component Switch
// ApolloProvider wraps our components with the ApolloClient so we can access GraphQL data from anywhere
// 'root' is the id of the <div> defined in index.html
ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider store={store} client={createClient()}>
      <App />
    </ApolloProvider>
  </BrowserRouter>
  , document.getElementById('root')
)
registerServiceWorker()