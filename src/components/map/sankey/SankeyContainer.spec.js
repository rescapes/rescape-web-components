import {asyncPropsFromSampleStateAndContainer, propsFromSampleStateAndContainer} from 'rescape-helpers-component';
import {queries, testPropsMaker} from 'components/map/sankey/SankeyContainer';
import {testPropsMaker as currentPropsMaker} from 'components/current/CurrentContainer';
import {testPropsMaker as regionPropsMaker} from 'components/region/RegionContainer';
import {eMap} from 'rescape-helpers-component';
import SankeyContainer from 'components/map/sankey/SankeyContainer';
import * as R from 'ramda';
import Current, {c as cCurrent} from 'components/current/Current';
import Region, {c as cRegion} from 'components/region/Region';
import {c} from 'components/map/sankey/Sankey';
import {gql} from 'apollo-client-preset';
import {apolloContainerTests} from 'rescape-helpers-component';
import {makeSchema} from 'rescape-sample-data'
const schema = makeSchema()

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

// Use this to get properties from parent containers to test our container
// This returns a promise for consistency across tests. Some parent test props are async
export const asyncParentPropsForSankey = () => {
  // Build up the correct parent props from Current and Region
  const currentProps = propsFromSampleStateAndContainer(currentPropsMaker, {});
  const currentViews = Current.views(currentProps).views;
  const currentRegionView = currentViews[cCurrent.currentRegion];
  // Get async props from the RegionContainer and then resolve the Region.views
  return asyncPropsFromSampleStateAndContainer(regionPropsMaker, currentRegionView)
    .then(props => Region.views(props).views[cRegion.regionSankey]);
};

describe('SankeyContainer', () => apolloContainerTests({
    schema,
    Container,
    componentName,
    childClassDataName,
    childClassLoadingName,
    childClassErrorName,
    testPropsMaker,
    asyncParentProps: asyncParentPropsForSankey,
    query,
    queryVariables,
    errorMaker
  })
);
