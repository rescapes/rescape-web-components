jest.dontMock('./Current');
import current from './Current'
import {eMap} from 'helpers/componentHelpers';
import {testPropsMaker} from 'components/current/CurrentContainer';
import {propsFromSampleStateAndContainer, shallowWrap} from 'helpers/testHelpers';
const [Current] = eMap([current]);

describe('The current application', () => {
  const props = propsFromSampleStateAndContainer(testPropsMaker,
    {
      // style dimensions are normally from the parent
      style: {
        width: 0.5,
        height: 0.5
      }
    }
  );

  test('Current can mount', () => {
    expect(shallowWrap(Current, props)).toMatchSnapshot();
  });
});
