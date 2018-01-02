import {
  propsFromSampleStateAndContainer
} from 'helpers/testHelpers';
import RegionContainer, {testPropsMaker, queries} from 'components/region/RegionContainer';
import {testPropsMaker as currentPropsMaker} from 'components/current/CurrentContainer';
import {eMap} from 'helpers/componentHelpers';
import * as R from 'ramda';
import Current, {c as cCurrent} from 'components/current/Current';
import {c} from 'components/region/Region';
import {gql} from 'apollo-client-preset';
import {apolloContainerTests} from 'helpers/apolloContainerTestHelpers';

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

const asyncParentProps = () => new Promise((resolve) => {
  const currentProps = propsFromSampleStateAndContainer(currentPropsMaker, {});
  const currentViews = Current.views(currentProps).views;
  const parentProps = currentViews[cCurrent.currentRegion];
  resolve(parentProps);
});

describe('RegionContainer', () => apolloContainerTests({
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
