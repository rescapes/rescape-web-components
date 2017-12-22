import {mapStateToProps} from './RegionContainer';
import {
  eitherToPromise,
  makeSampleInitialState,
  mockApolloClientWithSamples,
  propsFromSampleStateAndContainer, wrapWithMockGraphqlAndStore
} from 'helpers/testHelpers';
import RegionContainer, {testPropsMaker, queries} from 'components/region/RegionContainer';
import {testPropsMaker as currentPropsMaker} from 'components/current/CurrentContainer';
import {eMap} from 'helpers/componentHelpers';
import * as R from 'ramda';
import {createWaitForElement} from 'enzyme-wait';
import Current, {c} from 'components/current/Current';
import {c} from 'components/region/Region'
import {gql} from 'apollo-client-preset';
import {getClass} from 'helpers/styleHelpers';

describe('RegionContainer', () => {
  // Get the parent Region from the CurrentContainer's testPropMaker
  const currentProps = propsFromSampleStateAndContainer(currentPropsMaker, {});
  const currentViews = Current.views(currentProps).views;
  const parentProps = R.merge({
    style: {
      width: 500,
      height: 500
    }
  }, currentViews[c.currentRegion]);

  test('mapStateToProps', async () => {
    // Get the test props for RegionContainer
    const props = await propsFromSampleStateAndContainer(testPropsMaker, parentProps).then(eitherToPromise)
    expect(props).toMatchSnapshot();
  });

  test('query', async () => {
    const props = await propsFromSampleStateAndContainer(testPropsMaker, parentProps).then(eitherToPromise)
    const data = await mockApolloClientWithSamples().query({
      query: gql`${queries.region.query}`,
      variables: {
        regionId: props.data.region.id
      },
      context: {
        dataSource: makeSampleInitialState()
      }
    });
    expect(data).toMatchSnapshot();
  });

  test('render', (done) => {
    const [regionContainer] = eMap([RegionContainer]);
    const wrapper = wrapWithMockGraphqlAndStore(regionContainer(parentProps));
    const component = wrapper.find('Region');
    expect(component.props()).toMatchSnapshot();
    // Wait for region-mapbox element to exist, which indicates data loading is complete
    const waitForSample = createWaitForElement(`.${getClass(c.regionMapboxOuter)}`);
    waitForSample(component).then(
      component => {
        expect(component.text()).to.include('ready');
        done();
      }
    );
  });
});
