import {asyncPropsFromSampleStateAndContainer, propsFromSampleStateAndContainer} from 'helpers/testHelpers';
import {queries, testPropsMaker} from 'components/map/mapbox/MapboxContainer';
import {testPropsMaker as currentPropsMaker} from 'components/current/CurrentContainer';
import {testPropsMaker as regionPropsMaker} from 'components/region/RegionContainer';
import {eMap} from 'helpers/componentHelpers';
import MapboxContainer from 'components/map/mapbox/MapboxContainer';
import * as R from 'ramda';
import Current, {c as cCurrent} from 'components/current/Current';
import Region, {c as cRegion} from 'components/region/Region';
import Mapbox, {c} from 'components/map/mapbox/Mapbox';
import {gql} from 'apollo-client-preset';
import {apolloContainerTests} from 'helpers/apolloContainerTestHelpers';

// Test this container
const [Container] = eMap([MapboxContainer]);
// Find this React component
const componentName = 'Mapbox';
// Find this class in the data renderer
const childClassDataName = c.mapboxMapGlOuter;
// Find this class in the loading renderer
const childClassLoadingName = c.mapboxLoading;
// Find this class in the error renderer
const childClassErrorName = c.mapboxError;
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
const asyncParentProps = () => {
  // Build up the correct parent props from Current and Region
  const currentProps = propsFromSampleStateAndContainer(currentPropsMaker, {});
  const currentViews = Current.views(currentProps).views;
  const currentRegionView = currentViews[cCurrent.currentRegion];
  // Get async props from the RegionContainer and then resolve the Region.views
  return asyncPropsFromSampleStateAndContainer(regionPropsMaker, currentRegionView)
    .then(props =>
      R.merge(
        {
          style: {
            width: 500,
            height: 500
          }
        },
        Region.views(props).views
      )[cRegion.regionMapbox]
    );
};

describe('MapboxContainer', () => apolloContainerTests({
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
