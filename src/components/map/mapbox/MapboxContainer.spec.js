import {mapStateToProps} from './MapboxContainer';
import {
  propsFromSampleStateAndContainer, wrapWithMockGraphqlAndStore
} from 'helpers/testHelpers';
import {testPropsMaker} from 'components/map/mapbox/MapboxContainer';
import {testPropsMaker as currentPropsMaker} from 'components/current/CurrentContainer'
import {testPropsMaker as regionPropsMaker} from 'components/region/RegionContainer'
import {eMap} from 'helpers/componentHelpers';
import MapboxContainer from 'components/map/mapbox/MapboxContainer';
import * as R from 'ramda'
import {c as cCurrent} from 'components/current/Current';
import {c as cRegion} from 'components/region/Region'

describe('MapboxContainer', () => {
  // Build up the correct parent props from Current and Region
  const currentProps = propsFromSampleStateAndContainer(currentPropsMaker, {})
  const regionProps = propsFromSampleStateAndContainer(regionPropsMaker, currentProps[cCurrent.currentRegion])

  const parentProps = R.merge({
    style: {
      width: 500,
      height: 500
    },
  }, regionProps[cRegion.regionMapbox])

  // Get the test props for MapboxContainer
  const props = propsFromSampleStateAndContainer(testPropsMaker, parentProps)

  test('mapStateToProps', () => {
    expect(props).toMatchSnapshot()
  })

  test('render', () => {
    const [mapboxContainer] = eMap([MapboxContainer]);
    const wrapper = wrapWithMockGraphqlAndStore(mapboxContainer(parentProps))
    const current = wrapper.find('Mapbox');
    expect(R.keys(current.props())).toEqual(['data', 'views'])
  })
});
