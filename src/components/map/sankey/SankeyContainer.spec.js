import {propsFromSampleStateAndContainer} from 'rescape-helpers-component';
import {mapStateToProps, queries} from 'components/map/sankey/SankeyContainer';
import {eMap} from 'rescape-helpers-component';
import * as R from 'ramda';
import {apolloContainerTests} from 'rescape-helpers-component';
import {createSampleConfig} from 'rescape-sample-data';
import makeSchema from 'schema/schema';
import {sampleInitialState} from 'helpers/helpers';
import {taskToPromise, reqStrPathThrowing} from 'rescape-ramda';
import Sankey, {c} from './Sankey';
import SankeyContainer from './SankeyContainer';
import {chainedParentPropsTask} from './SankeyContainer.sample';

const schema = makeSchema();

// Test this container
const [Container] = eMap([SankeyContainer]);
// Find this React component
const componentName = 'Sankey';
// Find this class in the data renderer
const childClassDataName = c.sankeyReactMapGlOuter;
// Find this class in the loading renderer
const childClassLoadingName = c.sankeyLoading;
// Find this class in the error renderer
const childClassErrorName = c.sankeyError;
const queryConfig = queries.geojson;

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
  queryConfig,
  chainedParentPropsTask,
  mapStateToProps,
  errorMaker
});
test('testMapStateToProps', testMapStateToProps);
test('testQuery', testQuery);
test('testRender', testRender);
test('testRenderError', testRenderError);
