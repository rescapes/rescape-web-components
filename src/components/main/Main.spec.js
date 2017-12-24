import {shallow} from 'enzyme';
import current from './Main'
import {sampleConfig} from 'data/samples/sampleConfig';
import initialState from 'data/initialState'
import * as R from 'ramda';
import {reqPath} from 'rescape-ramda'.throwing;
import {eMap} from 'helpers/componentHelpers';
import {mapStateToProps} from './MainContainer';
import {propsFromSampleStateAndContainer, shallowWrap} from 'helpers/testHelpers';
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
