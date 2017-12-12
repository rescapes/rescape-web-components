import {shallow} from 'enzyme';
import current from './Current'
import {sampleConfig} from 'data/samples/sampleConfig';
import initialState from 'data/initialState'
import {mapStateToProps} from './CurrentContainer';
import {eMap} from 'helpers/componentHelpers';
const [Current] = eMap([current]);

describe('The current application', () => {
  const state = initialState(sampleConfig);

  const props = {
    // Style proportional to the browser size
    style: {
      width: 0.5,
      height: 0.5
    }
  };

  test('Current can mount', () => {
    const wrapper = shallow(
      Current(mapStateToProps(state, props))
    );
    expect(wrapper).toMatchSnapshot();
  });
});
