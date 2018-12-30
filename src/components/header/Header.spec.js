import React from 'react';

import {propsFromSampleStateAndContainer, shallowWrap} from 'rescape-helpers-component';
import header from './Header'
import {eMap} from 'rescape-helpers-component';
import {samplePropsMaker} from 'components/header/headerContainer';
import {sampleInitialState} from '../../helpers/testHelpers';
const [Header] = eMap([header]);

describe('Header', () => {
  const props = propsFromSampleStateAndContainer(sampleInitialState, samplePropsMaker)

  test('Current can mount', () => {
    expect(shallowWrap(Header, props)).toMatchSnapshot();
  });
});
