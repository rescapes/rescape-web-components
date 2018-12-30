import mapGL from 'react-map-gl';
import mapbox from './Mapbox';
import {shallow} from 'enzyme';
import {propsFromSampleStateAndContainer} from 'rescape-helpers-test';
import {defaultRunConfig} from 'rescape-ramda';
import {eMap} from 'rescape-helpers-component';
import {sampleInitialState} from '../../../helpers/testHelpers';
import {samplePropsTaskMaker} from './MapboxContainer.sample';

const [MapGL, Mapbox] = eMap([mapGL, mapbox]);

describe('Mapbox', () => {
  test('Can mount', done => {
    propsFromSampleStateAndContainer(sampleInitialState, samplePropsTaskMaker,
      {
        // style dimensions are normally from the parent
        style: {
          width: 500,
          height: 500
        }
      }
    ).run().listen(defaultRunConfig({
      onResolved:
        props => {
          const wrapper = shallow(
            Mapbox(props)
          );
          expect(wrapper).toMatchSnapshot();
        }
    }));
  });
});

