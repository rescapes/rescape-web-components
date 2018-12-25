import {eMap} from 'rescape-helpers-component';
import {propsFromSampleStateAndContainer, shallowWrap} from 'rescape-helpers-component';
import main from 'components/main/Main';
import {samplePropsMaker} from 'components/main/MainContainer';
import {sampleInitialState} from 'helpers/testHelpers';
const [Main] = eMap([main]);

describe('Main', () => {
  const props = propsFromSampleStateAndContainer(sampleInitialState, samplePropsMaker,
    {
      // style dimensions are normally from the parent
      style: {
        width: 1080,
        height: 760
      }
    }
  );

  test('Main can mount', () => {
    expect(shallowWrap(Main, props)).toMatchSnapshot();
  });
});
