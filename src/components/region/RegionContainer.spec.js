import {mapStateToProps} from './RegionContainer';
import {
  propsFromSampleStateAndContainer, wrapWithMockGraphqlAndStore
} from 'helpers/testHelpers';
import {testPropsMaker} from 'components/region/RegionContainer';
import {testPropsMaker as currentPropsMaker} from 'components/current/CurrentContainer'
import {eMap} from 'helpers/componentHelpers';
import RegionContainer from 'components/region/RegionContainer';
import * as R from 'ramda'

describe('RegionContainer', () => {
  // Get the parent Region from the CurrentContainer's testPropMaker
  const {views: {regionProps}} = propsFromSampleStateAndContainer(currentPropsMaker, {})
  const parentProps = R.merge({
    style: {
      width: 500,
      height: 500
    },
  }, regionProps)
  // Get the test props for RegionContainer
  const props = propsFromSampleStateAndContainer(testPropsMaker, parentProps)

  test('mapStateToProps', () => {
    expect(props).toMatchSnapshot()
  })

  test('render', () => {
    const [regionContainer] = eMap([RegionContainer]);
    const wrapper = wrapWithMockGraphqlAndStore(regionContainer(parentProps))
    const current = wrapper.find('Region');
    expect(R.keys(current.props())).toEqual(['data', 'views'])
  })
});
