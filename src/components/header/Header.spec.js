import React from 'react';

import {propsFromSampleStateAndContainer, shallowWrap} from 'helpers/testHelpers';
import header from './Header'
import {eMap} from 'helpers/componentHelpers';
import {testPropsMaker} from 'components/header/headerContainer';
const [Header] = eMap([header]);

describe('Header', () => {
  const props = propsFromSampleStateAndContainer(testPropsMaker)

  test('Current can mount', () => {
    expect(shallowWrap(Header, props)).toMatchSnapshot();
  });
});
