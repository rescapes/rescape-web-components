import sankey from './Sankey';
import {mount} from 'enzyme';
import {chainedSamplePropsTask} from './SankeyContainer.sample';
import {propsFromSampleStateAndContainer} from 'rescape-helpers-test';
import {defaultRunConfig, defaultRunToResultConfig} from 'rescape-ramda';
import {fromPromised, task} from 'folktale/concurrency/task';
import {createWaitForElement} from 'enzyme-wait';
import reactMapGl from 'react-map-gl';

import {eMap} from 'rescape-helpers-component';
import {c} from 'components/map/sankey/Sankey';

const [Sankey] = eMap([sankey]);

describe('Sankey', () => {
  test('Can mount', (done) => {
    chainedSamplePropsTask.run().listen(
      defaultRunToResultConfig({
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
        const wrapper = mount(
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
          width: 1408,
          zoom: 7
        });

        // Wait for onViewportChange action to propogate
        return task(resolver =>
          setTimeout(() => {
            resolver.resolve(wrapper.find(reactMapGl));
          }, 1000)
        );
      }
      // This means return the resulting Right value, which in our case is the task we created
      ).get()
    ).run().listen(
      defaultRunConfig({
        onResolved: wrapper => {
          expect(wrapper.props().latitude).toEqual(50.598474100413014);
          done();
        }
      })
    );
  });
});

