import mapGL from 'react-map-gl'
import mapbox from './Mapbox'
import {shallow} from 'enzyme';
import {testPropsMaker} from './MapboxContainer';
import {propsFromSampleStateAndContainer} from 'rescape-helpers-component';

import {eMap} from 'rescape-helpers-component';
const [MapGL, Mapbox] = eMap([mapGL, mapbox]);

describe('Mapbox', () => {
  test('Can mount', () => {
    const props = propsFromSampleStateAndContainer(testPropsMaker,
      {
        // style dimensions are normally from the parent
        style: {
          width: 500,
          height: 500
        }
      }
    );

    const wrapper = shallow(
      Mapbox(props)
    );
    expect(wrapper).toMatchSnapshot();
  });
});

