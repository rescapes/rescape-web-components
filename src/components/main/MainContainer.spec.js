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
import {chainedSamplePropsTask, sampleAsyncParentProps} from 'components/main/MainContainer.sample';

// Test this container
const [Container] = eMap([MainContainer]);
// Find this React component
const componentName = 'Main';
// Find this class in the data renderer
const childClassDataName = c.main;
const initialState = sampleInitialState;
const asyncParentProps = sampleAsyncParentProps;

describe('MainContainer', () => {
  const {testMapStateToProps} = apolloContainerTests({
    Container,
    componentName,
    childClassDataName,
    chainedSamplePropsTask,
    asyncParentProps,
    initialState
  });
  // No Apollo, just run one test
  test('testMapStateToProps', testMapStateToProps);
});