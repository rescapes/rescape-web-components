import {shallow} from 'enzyme';
import {sampleConfig} from 'rescape-sample-data'
import {eMap} from 'rescape-helpers-component';
import {propsFromSampleStateAndContainer, shallowWrap} from 'rescape-helpers-component';
import main from 'components/main/Main';
import {testPropsMaker} from 'components/main/MainContainer';
const [Main] = eMap([main]);

describe('Main', () => {
  const props = propsFromSampleStateAndContainer(testPropsMaker,
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
