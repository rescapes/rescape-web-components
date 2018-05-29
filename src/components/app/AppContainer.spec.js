import appContainer, {queries} from 'components/app/AppContainer';
import {eMap} from 'rescape-helpers-component';
import * as R from 'ramda';
import {c} from 'components/app/App';
import {gql} from 'apollo-client-preset';
import {apolloContainerTests} from 'rescape-helpers-component';
import {MemoryRouter as memoryRouter} from 'react-router-dom';
import makeSchema from 'schema/schema';
import {sampleInitialState} from 'helpers/helpers';
import {chainedSamplePropsTask} from 'components/app/AppContainer.sample';
import {samplePropsMaker} from 'components/map/mapbox/MapboxContainer';

const schema = makeSchema();

const [AppContainer, MemoryRouter] = eMap([appContainer, memoryRouter]);
// Test this container with a memory router so we can test the main route

const Container = (...args) => MemoryRouter({initialEntries: [{pathname: '/', key: 'testKey'}]},
  AppContainer(...args)
);

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
// Set an invalid user id to query
const errorMaker = parentProps => R.set(R.lensPath(['user', 'id']), 'foo', parentProps);

describe('AppContainer', () => {
  const {testMapStateToProps, testQuery, testRenderError, testRender} = apolloContainerTests({
    initialState: sampleInitialState,
    schema,
    Container,
    componentName,
    childClassDataName,
    childClassLoadingName,
    childClassErrorName,
    // TODO this will be just a Task when I refactor apolloContainerTests to use Tasks
    asyncParentProps: () => taskToPromise(chainedSamplePropsTask),
    samplePropsMaker,
    query,
    queryVariables,
    errorMaker
  });
  test('testMapStateToProps', testMapStateToProps);
  test('testQuery', testQuery);
  test('testRender', testRender);
  test('testRenderError', testRenderError);
});
