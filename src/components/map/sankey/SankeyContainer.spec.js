import {asyncPropsFromSampleStateAndContainer, propsFromSampleStateAndContainer} from 'rescape-helpers-component';
import {queries, testPropsMaker} from 'components/map/sankey/SankeyContainer';
import {eMap} from 'rescape-helpers-component';
import SankeyContainer from 'components/map/sankey/SankeyContainer';
import * as R from 'ramda';
import {c} from 'components/map/sankey/Sankey';
import {gql} from 'apollo-client-preset';
import {apolloContainerTests} from 'rescape-helpers-component';
import makeSchema from 'schema/schema';
import {createSampleConfig} from 'rescape-sample-data';
import {sampleInitialState} from 'helpers/helpers';
import {sampleAsyncParentProps} from 'components/map/sankey/SankeyContainer.sample';

const schema = makeSchema();

// Test this container
const [Container] = eMap([SankeyContainer]);
// Find this React component
const componentName = 'Sankey';
// Find this class in the data renderer
const childClassDataName = c.sankeySvgOverlay;
// Find this class in the loading renderer
const childClassLoadingName = c.sankeyLoading;
// Find this class in the error renderer
const childClassErrorName = c.sankeyError;
// Run this apollo query
const query = gql`${queries.geojson.query}`;
// Use these query variables
const queryVariables = props => ({
  regionId: props.data.region.id
});
// Use this to make a query that errors
const errorMaker = parentProps => R.set(R.lensPath(['region', 'id']), 'foo', parentProps);
const initialState = sampleInitialState;
const asyncParentProps = sampleAsyncParentProps;

describe('SankeyContainer', () => apolloContainerTests({
    initialState,
    schema,
    Container,
    componentName,
    childClassDataName,
    childClassLoadingName,
    childClassErrorName,
    testPropsMaker,
    asyncParentProps,
    query,
    queryVariables,
    errorMaker
  })
);
