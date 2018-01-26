import {shallow} from 'enzyme';
import app from './App'
import {sampleConfig} from 'data/samples/sampleConfig';
import initialState from 'data/initialState'
import {eMap} from 'rescape-helpers-component';
const [App] = eMap([app]);
import {mapStateToProps} from './AppContainer';

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
      App(mapStateToProps(state, props))
    );
    expect(wrapper).toMatchSnapshot();
  });
});
