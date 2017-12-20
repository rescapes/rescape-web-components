import {mapStateToProps} from './RegionContainer';
import {
  makeSampleInitialState,
  mockApolloClientWithSamples,
  propsFromSampleStateAndContainer, wrapWithMockGraphqlAndStore
} from 'helpers/testHelpers';
import RegionContainer, {testPropsMaker, queries} from 'components/region/RegionContainer';
import {testPropsMaker as currentPropsMaker} from 'components/current/CurrentContainer'
import {eMap} from 'helpers/componentHelpers';
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

  test('query', async () => {
    const data = await mockApolloClientWithSamples().query({
      query: queries.region.query,
      variables: {
        regionId: props.data.region.id
      },
      context: {
        dataSource: makeSampleInitialState()
      }
    })
    expect(data).toMatchSnapshot()
  })

  test('render', (done) => {
    const [regionContainer] = eMap([RegionContainer]);
    const wrapper = wrapWithMockGraphqlAndStore(regionContainer(parentProps))
    const component = wrapper.find('Region');
    expect(R.keys(component.props())).toEqual(['data', 'views'])
    /*
    const waitForSample = createWaitForElement('.region-mapbox-outer');
    waitForSample(component).then(
      component => expect(component.text()).to.include('ready')
    );
    */
  })
});
