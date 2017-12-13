import {shallow} from 'enzyme';
import current from './Current'
import {eMap} from 'helpers/componentHelpers';
import {testPropsMaker} from 'components/current/CurrentContainer';
const [Current] = eMap([current]);

describe('The current application', () => {
  const props = propsFromSampleStateAndContainer(testPropsMaker,
    {
      // style dimensions are normally from the parent
      style: {
        width: 0.5
        height: 0.5
      }
    }
  );

  test('Current can mount', () => {
    const wrapper = shallow(
      Current(props)
    );
    expect(wrapper).toMatchSnapshot();
  });
});
