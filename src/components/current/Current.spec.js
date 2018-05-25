import {sampleInitialState} from 'helpers/helpers';

import current from './Current'
import {eMap} from 'rescape-helpers-component';
import {samplePropsMaker} from 'components/current/CurrentContainer';
import {propsFromSampleStateAndContainer, shallowWrap} from 'rescape-helpers-component';
const [Current] = eMap([current]);

describe('The current application', () => {
  const props = propsFromSampleStateAndContainer(sampleInitialState, samplePropsMaker,
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
