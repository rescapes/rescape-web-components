import {shallow} from 'enzyme';
import current from './Main'
import {sampleConfig} from 'data/samples/sampleConfig';
import initialState from 'data/initialState'
import * as R from 'ramda';
import {throwing as rt} from 'rescape-ramda';
import {eMap} from 'rescape-helpers-component';
import {mapStateToProps} from './MainContainer';
import {propsFromSampleStateAndContainer, shallowWrap} from 'rescape-helpers';
import main from 'components/main/Main';
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
