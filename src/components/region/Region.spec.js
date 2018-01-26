import React from 'react';

import {propsFromSampleStateAndContainer, shallowWrap} from 'rescape-helpers-component';
import region from './Region'
import {eMap} from 'rescape-helpers-component';
import {testPropsMaker} from 'components/current/CurrentContainer';
const [Region] = eMap([region]);

describe('Region', () => {
  const props = propsFromSampleStateAndContainer(testPropsMaker,
    {
      // style dimensions are normally from the parent
      style: {
        width: 500,
        height: 500
      }
    }
  );

  test('Current can mount', () => {
    expect(shallowWrap(Region, props)).toMatchSnapshot();
  });
});
