import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import app from 'components/app';
import registerServiceWorker from './registerServiceWorker';
import {BrowserRouter as browserRouter} from 'react-router-dom';
import {ApolloProvider as apolloProvider} from 'react-apollo';
import createClient from './apolloClient';
import {Provider as provider} from 'react-redux';
import storeCreator from './store';
import {getCurrentConfig} from 'rescape-sample-data';
import {eMap} from 'rescape-helpers-component';
import * as R from 'ramda';
import {mockApolloClientWithSamples} from 'rescape-helpers-component';
import {resolvedSchema} from 'helpers/helpers'

import {calculateResponsiveState} from 'redux-responsive';
const [BrowserRouter, ApolloProvider, Provider, App] = eMap([browserRouter, apolloProvider, provider, app]);

// Create a store based on the configured environment (development, production, test)
const store = storeCreator(getCurrentConfig());
window.addEventListener('resize', () => store.dispatch(calculateResponsiveState(window)))
// Initialize
store.dispatch(calculateResponsiveState(window))

// Set the client to the mockApolloClient for testingj
const client = R.cond([
  [R.equals('test'), () => mockApolloClientWithSamples(resolvedSchema)],
  [R.T, () => createClient()]
])(process.env.NODE_ENV);

// Render the React components
// BrowserRouter routes anything defined in a child component Switch
// ApolloProvider wraps our components with the ApolloClient so we can access GraphQL data from anywhere
// 'root' is the id of the <div> defined in index.html
ReactDOM.render(
  BrowserRouter({basename: '/'},
    Provider({store},
      ApolloProvider({client},
        App()
      )
    )
  ),
  document.getElementById('root'));
registerServiceWorker();