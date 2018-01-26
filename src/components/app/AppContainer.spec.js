import appContainer, {testPropsMaker, queries} from 'components/app/AppContainer';
import {eMap} from 'rescape-helpers-component';
import * as R from 'ramda';
import {c} from 'components/app/App';
import {gql} from 'apollo-client-preset';
import {apolloContainerTests} from 'rescape-helpers';
import {MemoryRouter as memoryRouter} from 'react-router-dom'
import {makeSchema} from 'rescape-sample-data'
const schema = makeSchema()

const [AppContainer, MemoryRouter] = eMap([appContainer, memoryRouter]);
// Test this container with a memory router so we can test the main route
const Container = (...args) => MemoryRouter({initialEntries: [ '/' ]},
  AppContainer(...args)
)

// Find this React component
const componentName = 'App';
// Find this class in the data renderer
const childClassDataName = c.appBody;
// Find this class in the loading renderer
const childClassLoadingName = c.appLoading;
// Find this class in the error renderer
const childClassErrorName = c.appError;
// Run this apollo query
const query = gql`${queries.userRegions.query}`;
// Use these query variables
const queryVariables = props => ({
  userId: props.data.user.id
});
const errorMaker = parentProps => R.set(R.lensPath(['user', 'id']), 'foo', parentProps);

/**
 * Nothing to do here, since App has no parent component
 */
describe('AppContainer', () => apolloContainerTests({
    schema,
    Container,
    componentName,
    childClassDataName,
    childClassLoadingName,
    childClassErrorName,
    testPropsMaker,
    query,
    queryVariables,
    errorMaker
  })
);
