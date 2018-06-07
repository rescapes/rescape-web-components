import mapGL from 'react-map-gl';
import sankey from './Sankey';
import {shallow} from 'enzyme';
import {chainedSamplePropsTask} from './SankeyContainer.sample';
import {propsFromSampleStateAndContainer} from 'rescape-helpers-component';
import {defaultRunToEitherConfig} from 'rescape-ramda';

import {eMap} from 'rescape-helpers-component';
import {sampleInitialState} from 'helpers/helpers';

const [MapGL, Sankey] = eMap([mapGL, sankey]);

describe('Sankey', () => {
  test('Can mount', (done) => {
    chainedSamplePropsTask.run().listen(
      defaultRunToEitherConfig({
        onResolved: containerProps => {
          const wrapper = shallow(
            Sankey(containerProps)
          );
          expect(wrapper).toMatchSnapshot();
          done();
        }
      })
    );
  });

  test('Can update viewport', (done) => {
    chainedSamplePropsTask.chain(containerPropsEither => containerPropsEither.map(
      containerProps => {
        const wrapper = shallow(
          Sankey(containerProps)
        );
        // Change the viewport
        containerProps.onViewportChange({
          altitude: 1.5,
          bearing: 0,
          height: 673,
          latitude: 50.598474100413014,
          longitude: 2.005513671874946,
          maxPitch: 60,
          maxZoom: 20,
          minPitch: 0,
          minZoom: 0,
          pitch: 0,
          transitionDuration: 0,
          transitionInterpolator: {propNames: Array(5)},
          transitionInterruption: 1,
          width: 1408,
          zoom: 7
        });
      }
    )).
    run().listen(
      defaultRunToEitherConfig({
        onResolved: containerProps => {

          done();
        }
      })
    );
  });
});

