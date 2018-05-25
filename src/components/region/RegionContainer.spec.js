import {
  propsFromSampleStateAndContainer
} from 'rescape-helpers-component';
import RegionContainer, {samplePropsMaker, queries} from 'components/region/RegionContainer';
import {samplePropsMaker as currentPropsMaker} from 'components/current/CurrentContainer';
import {eMap} from 'rescape-helpers-component';
import * as R from 'ramda';
import Current, {c as cCurrent} from 'components/current/Current';
import {c} from 'components/region/Region';
import {gql} from 'apollo-client-preset';
import {apolloContainerTests} from 'rescape-helpers-component';
import makeSchema from 'schema/schema';
import {sampleInitialState} from 'helpers/helpers';
import {sampleAsyncParentProps} from 'components/region/RegionContainer.sample';

const schema = makeSchema();

// Test this container
const [Container] = eMap([RegionContainer]);
// Find this React component
const componentName = 'Region';
// Find this class in the data renderer
const childClassDataName = c.regionMapboxOuter;
// Find this class in the loading renderer
const childClassLoadingName = c.regionLoading;
// Find this class in the error renderer
const childClassErrorName = c.regionError;
// Run this apollo query
const query = gql`${queries.region.query}`;
// Use these query variables
const queryVariables = props => ({
  regionId: props.data.region.id
});
const errorMaker = parentProps => R.set(R.lensPath(['region', 'id']), 'foo', parentProps);
const asyncParentProps = sampleAsyncParentProps;

describe('RegionContainer', () => apolloContainerTests({
    initialState: sampleInitialState,
    schema,
    Container,
    componentName,
    childClassDataName,
    childClassLoadingName,
    childClassErrorName,
    samplePropsMaker,
    asyncParentProps,
    query,
    queryVariables,
    errorMaker
  })
);
