import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import App from './components/App'
import registerServiceWorker from './registerServiceWorker'
import { BrowserRouter } from 'react-router-dom'
import { GC_AUTH_TOKEN, SERVICE_ID } from './constants'
import { ApolloLink, split } from 'apollo-client-preset'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'


// A link to our simple URI on graph.cool
const httpLink = new HttpLink({ uri: `https://api.graph.cool/simple/v1/${SERVICE_ID}` })

// Middleware authentication. Relies on our constant auth token
const middlewareAuthLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem(GC_AUTH_TOKEN)
  const authorizationHeader = token ? `Bearer ${token}` : null
  operation.setContext({
    headers: {
      authorization: authorizationHeader
    }
  })
  // Forward the modified operation to next Middleware
  return forward(operation)
})

const httpLinkWithAuthToken = middlewareAuthLink.concat(httpLink)

// Create a WebSocketLink to handle subscriptions from our subscription URI
const wsLink = new WebSocketLink({
  uri: `wss://subscriptions.graph.cool/v1/${SERVICE_ID}`,
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(GC_AUTH_TOKEN),
    },
  }
})

// Split queries between HTTP for Queries/Mutations and Websockets for Subscriptions.
const link = split(
  // query is the Operation
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  // Use WebSocketLink
  wsLink,
  // Else use HttpLink with auth token
  httpLinkWithAuthToken,
)

// Create the ApolloClient using the following ApolloClientOptiosn
const client = new ApolloClient({
  // Ths split Link
  link,
  // Use InMemoryCache
  cache: new InMemoryCache()
})

// Render the React components
// BrowserRouter routes anything defined in a child component Switch
// ApolloProvider wraps our components with the ApolloClient so we can access GraphQL data from anywhere
// 'root' is the id of the <div> defined in index.html
ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>
  , document.getElementById('root')
)
registerServiceWorker()