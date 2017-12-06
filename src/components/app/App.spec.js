const {shallow} = require('enzyme');
const App = require('./App').default;
const {sampleConfig} = require('data/samples/sampleConfig');
const initialState = require('data/initialState').default;
const {eMap} = require('helpers/componentHelpers');
const {mapStateToProps} = require('./AppContainer');

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
