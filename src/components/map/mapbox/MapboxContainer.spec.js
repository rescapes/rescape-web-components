import {
  asyncPropsFromSampleStateAndContainer, eitherToPromise, makeSampleInitialState, mockApolloClientWithSamples,
  propsFromSampleStateAndContainer, waitForChildComponentRender, wrapWithMockGraphqlAndStore
} from 'helpers/testHelpers';
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
import {getClass} from 'helpers/styleHelpers';

describe('MapboxContainer', async () => {

  const asyncParentProps = () => {
    // Build up the correct parent props from Current and Region
    const currentProps = propsFromSampleStateAndContainer(currentPropsMaker, {});
    const currentViews = Current.views(currentProps).views;
    const currentRegionView = currentViews[cCurrent.currentRegion]
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
      )

  };

  test('mapStateToProps', async () => {
    const parentProps = await asyncParentProps();
    // Get the test props for RegionContainer
    const props = await propsFromSampleStateAndContainer(testPropsMaker, parentProps).then(eitherToPromise);
    expect(props).toMatchSnapshot();
  });

  test('query', async () => {
    const parentProps = await asyncParentProps();
    const props = await propsFromSampleStateAndContainer(testPropsMaker, parentProps).then(eitherToPromise);
    const data = await mockApolloClientWithSamples().query({
      query: gql`${queries.geojson.query}`,
      variables: {
        regionId: props.data.region.id
      },
      context: {
        dataSource: makeSampleInitialState()
      }
    });
    expect(data).toMatchSnapshot();
  });

  test('render', async (done) => {
    const parentProps = await asyncParentProps();
    const [mapboxContainer] = eMap([MapboxContainer]);
    const wrapper = wrapWithMockGraphqlAndStore(mapboxContainer(parentProps));
    const componentName = 'Mapbox';
    const childClassName = c.mapboxMapGlOuter;
    const component = wrapper.find(componentName);
    expect(component.find(`.${getClass(c.mapboxLoading)}`).length).toEqual(1);
    expect(component.props()).toMatchSnapshot();
    waitForChildComponentRender(wrapper, componentName, childClassName, done);
  });

  test('renderError', async (done) => {
    const parentProps = await asyncParentProps()
    const [mapboxContainer] = eMap([MapboxContainer]);
    const wrapper = wrapWithMockGraphqlAndStore(mapboxContainer(
      // Make the region id something nonexistent
      R.set(R.lensPath(['region', 'id']), 'foo', parentProps)
    ));
    const componentName = 'Mapbox';
    const childClassName = c.mapboxMapGlOuter;
    const component = wrapper.find(componentName);
    expect(component.find(`.${getClass(c.mapboxLoading)}`).length).toEqual(1);
    expect(component.props()).toMatchSnapshot();
    waitForChildComponentRender(wrapper, componentName, childClassName, done);
  });
});
