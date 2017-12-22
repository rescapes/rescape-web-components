import {
  asyncPropsFromSampleStateAndContainer,
  propsFromSampleStateAndContainer, wrapWithMockGraphqlAndStore
} from 'helpers/testHelpers';
import {testPropsMaker} from 'components/map/mapbox/MapboxContainer';
import {testPropsMaker as currentPropsMaker} from 'components/current/CurrentContainer';
import {testPropsMaker as regionPropsMaker} from 'components/region/RegionContainer';
import {eMap} from 'helpers/componentHelpers';
import MapboxContainer from 'components/map/mapbox/MapboxContainer';
import * as R from 'ramda';
import Current, {c as cCurrent} from 'components/current/Current';
import Region, {c as cRegion} from 'components/region/Region';

describe('MapboxContainer', () => {
  test('render', async () => {
    // Build up the correct parent props from Current and Region
    const currentProps = propsFromSampleStateAndContainer(currentPropsMaker, {});
    const currentViews = Current.views(currentProps).views
    // Get async props from the RegionContainer and then resolve the Region view props
    const regionViews = await asyncPropsFromSampleStateAndContainer(regionPropsMaker, currentViews[cCurrent.currentRegion])
      .then(props => Region.views(props).views)

    const parentProps = R.merge({
      style: {
        width: 500,
        height: 500
      }
    }, regionViews[cRegion.regionMapbox]);

    // Get the test props for MapboxContainer
    const props = propsFromSampleStateAndContainer(testPropsMaker, parentProps);

    expect(props).toMatchSnapshot();
    const [mapboxContainer] = eMap([MapboxContainer]);
    const wrapper = wrapWithMockGraphqlAndStore(mapboxContainer(parentProps));
    const current = wrapper.find('Mapbox');
    expect(R.keys(current.props())).toEqual(['data', 'views']);
  });
});
