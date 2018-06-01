import {propsFromSampleStateAndContainer} from 'rescape-helpers-component';
import {queries} from 'components/map/mapbox/MapboxContainer';
import {eMap} from 'rescape-helpers-component';
import MapboxContainer from 'components/map/mapbox/MapboxContainer';
import * as R from 'ramda';
import Mapbox, {c} from 'components/map/mapbox/Mapbox';
import {apolloContainerTests} from 'rescape-helpers-component';
import {createSampleConfig} from 'rescape-sample-data';
import makeSchema from 'schema/schema';
import {sampleInitialState} from 'helpers/helpers';
import {chainedSamplePropsTask} from './MapboxContainer.sample';
import {taskToPromise, reqStrPathThrowing} from 'rescape-ramda'

const schema = makeSchema();

// Test this container
const [Container] = eMap([MapboxContainer]);
// Find this React component
const componentName = 'Mapbox';
// Find this class in the data renderer
const childClassDataName = c.mapboxMapReactGlOuter;
// Find this class in the loading renderer
const childClassLoadingName = c.mapboxLoading;
// Find this class in the error renderer
const childClassErrorName = c.mapboxError;
const queryConfig = queries.geojson


// Use this to make a query that errors
const errorMaker = parentProps => R.set(R.lensPath(['region', 'id']), 'foo', parentProps);

const {testMapStateToProps, testQuery, testRenderError, testRender} = apolloContainerTests({
  initialState: sampleInitialState,
  schema,
  Container,
  componentName,
  childClassDataName,
  childClassLoadingName,
  childClassErrorName,
  query,
  chainedSamplePropsTask,
  queryVariables,
  errorMaker
});
test('testMapStateToProps', testMapStateToProps);
test('testQuery', testQuery);
test('testRender', testRender);
test('testRenderError', testRenderError);
