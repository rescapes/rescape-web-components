import {mapStateToProps} from './MainContainer';
import {
  eitherToPromise,
  makeSampleInitialState,
  mockApolloClientWithSamples,
  propsFromSampleStateAndContainer, wrapWithMockGraphqlAndStore
} from 'rescape-helpers';
import MainContainer, {testPropsMaker, queries} from 'components/main/MainContainer';
import {eMap} from 'rescape-helpers-component';
import {createWaitForElement} from 'enzyme-wait';
import {gql} from 'apollo-client-preset';

import {resolvedSchema} from 'helpers/helpers'

describe('MainContainer', () => {
  const parentProps = {
    style: {
      width: 500,
      height: 500
    }
  }

  test('mapStateToProps', async () => {
    // Get the test props for MainContainer
    const props = await propsFromSampleStateAndContainer(testPropsMaker, parentProps).then(eitherToPromise)
    expect(props).toMatchSnapshot();
  });

  test('query', async () => {
    const props = await propsFromSampleStateAndContainer(testPropsMaker, parentProps).then(eitherToPromise)
    const data = await mockApolloClientWithSamples(resolvedSchema).query({
      query: gql`${queries.allUserRegions.query}`,
      variables: {
        userId: props.data.user.id
      },
      context: {
        dataSource: makeSampleInitialState()
      }
    });
    expect(data).toMatchSnapshot();
  });

  test('render', (done) => {
    const [mainContainer] = eMap([MainContainer]);
    const wrapper = wrapWithMockGraphqlAndStore(mainContainer(parentProps));
    const component = wrapper.find('Main');
    expect(component.props()).toMatchSnapshot();
    // Wait for region-mapbox element to exist, which indicates data loading is complete
    const waitForSample = createWaitForElement('Main');
    waitForSample(component).then(
      component => {
        expect(component.text()).to.include('ready');
        done();
      }
    );
  });
});
