import {mapStateToProps} from './MainContainer';
import {
  apolloContainerTests, propsFromSampleStateAndContainer,
  wrapWithMockGraphqlAndStore
} from 'rescape-helpers-component';
import MainContainer from './MainContainer';
import {eMap} from 'rescape-helpers-component';
import React from 'react';
import {sampleInitialState} from 'helpers/helpers';
import {c} from 'components/main/Main';

// Test this container
const [Container] = eMap([MainContainer]);
// Find this React component
const componentName = 'Main';
// Find this class in the data renderer
const childClassDataName = c.main;
const initialState = sampleInitialState;

describe('MainContainer', () => {
  const {testMapStateToProps} = apolloContainerTests({
    Container,
    componentName,
    childClassDataName,
    initialState
  });
  // No Apollo, just run one test
  test('testMapStateToProps', testMapStateToProps);
});