/**
 * Created by Andy Likuski on 2017.11.29
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import {ApolloClient} from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {getMainDefinition} from 'apollo-utilities';
import {ApolloLink, split} from 'apollo-client-preset';
import {WebSocketLink} from 'apollo-link-ws';
import config from './config';
import fetch from 'node-fetch';
import {createHttpLink} from 'apollo-link-http';

const {settings: {graphcool: {authTokenKey, serviceIdKey}}} = config;

/**
 * Creates an ApolloClient
 * @return {ApolloClient<NormalizedCache>}
 */
export default () => {

// A link to our simple URI on graph.cool
  const httpLink = createHttpLink({uri: `https://api.graph.cool/simple/v1/${serviceIdKey}`, fetch});

// Middleware authentication. Relies on our constant auth token
  const middlewareAuthLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem(authTokenKey);
    const authorizationHeader = token ? `Bearer ${token}` : null;
    operation.setContext({
      headers: {
        authorization: authorizationHeader
      }
    });
    // Forward the modified operation to next Middleware
    return forward(operation);
  });

  const httpLinkWithAuthToken = middlewareAuthLink.concat(httpLink);

  // Create a WebSocketLink to handle subscriptions from our subscription URI
  const wsLink = new WebSocketLink({
    uri: `wss://subscriptions.graph.cool/v1/${serviceIdKey}`,
    options: {
      reconnect: true,
      connectionParams: {
        authToken: localStorage.getItem(authTokenKey)
      }
    }
  });

// Split queries between HTTP for Queries/Mutations and Websockets for Subscriptions.
  const link = split(
    // query is the Operation
    ({query}) => {
      const {kind, operation} = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    // Use WebSocketLink
    wsLink,
    // Else use HttpLink with auth token
    httpLinkWithAuthToken

  // Create the ApolloClient using the following ApolloClientOptions
  return new ApolloClient({
    // Ths split Link
    link,
    // Use InMemoryCache
    cache: new InMemoryCache()
  });
}