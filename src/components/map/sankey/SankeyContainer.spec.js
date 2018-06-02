import {propsFromSampleStateAndContainer} from 'rescape-helpers-component';
import {eMap} from 'rescape-helpers-component';
import * as R from 'ramda';
import {apolloContainerTests} from 'rescape-helpers-component';
import makeSchema from 'schema/schema';
import {createSampleConfig} from 'rescape-sample-data';
import {sampleInitialState} from 'helpers/helpers';
import {c} from 'components/map/sankey/Sankey';
import sankeyContainer, {queries, mapStateToProps} from './SankeyContainer';
import {chainedParentPropsTask} from './SankeyContainer.sample';

const schema = makeSchema();

// Test this container
const [Container] = eMap([sankeyContainer]);
// Find this React component
const componentName = 'Sankey';
// Find this class in the data renderer
const childClassDataName = c.sankeySvgOverlay;
// Find this class in the loading renderer
const childClassLoadingName = c.sankeyLoading;
// Find this class in the error renderer
const childClassErrorName = c.sankeyError;
const queryConfig = queries.geojson;
// Use this to make a query that errors
const errorMaker = parentProps => R.set(R.lensPath(['region', 'id']), 'foo', parentProps);

describe('SankeyContainer', () => apolloContainerTests({
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
  })
);
