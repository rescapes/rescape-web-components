import {
  asyncPropsFromSampleStateAndContainer, eitherToPromise, makeSampleInitialState, mockApolloClientWithSamples,
  propsFromSampleStateAndContainer, wrapWithMockGraphqlAndStore
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
import {createWaitForElement} from 'enzyme-wait';
import {getClass} from 'helpers/styleHelpers';

describe('MapboxContainer', async () => {

  const asyncParentProps = () => {
    // Build up the correct parent props from Current and Region
    const currentProps = propsFromSampleStateAndContainer(currentPropsMaker, {});
    const currentViews = Current.views(currentProps).views;
    // Get async props from the RegionContainer and then resolve the Region view props
    return asyncPropsFromSampleStateAndContainer(regionPropsMaker, currentViews[cCurrent.currentRegion])
      .then(props =>
        R.merge({
          style: {
            width: 500,
            height: 500
          }
        }, Region.views(props).views)[cRegion.regionMapbox]
      )
  };

  test('mapStateToProps', async () => {
    const parentProps = await asyncParentProps()
    // Get the test props for RegionContainer
    const props = await propsFromSampleStateAndContainer(testPropsMaker, parentProps).then(eitherToPromise);
    expect(props).toMatchSnapshot();
  });

  test('query', async () => {
    const parentProps = await asyncParentProps()
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
    const parentProps = await asyncParentProps()
    const [mapboxContainer] = eMap([MapboxContainer]);
    const wrapper = wrapWithMockGraphqlAndStore(mapboxContainer(parentProps));
    const component = wrapper.find('Mapbox');
    expect(component.props()).toMatchSnapshot();
    // Waith for the MapGl component to render, which indicates that data loading completed
    const waitForSample = createWaitForElement(`.${getClass(c.mapboxMapGlOuter)}`)
    waitForSample(component).then(
      child => {
        expect(child.text()).to.include('ready');
        done();
      }
    )
    .catch(error => {
      throw new Error(`${error.message}\n${wrapper.find('Mapbox').debug()}`)
      done()
    } )
  });
});
