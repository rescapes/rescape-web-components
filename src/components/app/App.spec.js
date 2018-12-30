import {shallow} from 'enzyme';
import app from './App'
import {getCurrentConfig, initialState} from 'rescape-sample-data'
import {eMap} from 'rescape-helpers-component';
import {mapStateToProps} from './AppContainer';
import {sampleInitialState} from '../../helpers/testHelpers';
const [App] = eMap([app]);

describe('App', () => {
  // Top-level, probably won't get props from anyone
  const props = {};

  test('Can mount', () => {
    const wrapper = shallow(
      App(mapStateToProps(sampleInitialState, props))
    );
    expect(wrapper).toMatchSnapshot();
  });
});
