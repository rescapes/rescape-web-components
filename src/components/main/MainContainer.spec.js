import {apolloContainerTests} from 'rescape-helpers-component';
import MainContainer from './MainContainer';
import {eMap} from 'rescape-helpers-component';
import React from 'react';
import {sampleInitialState} from '../../helpers/testHelpers';
import {c} from 'components/main/Main';
import {chainedParentPropsTask} from './MainContainer.sample';
import {mapStateToProps} from './MainContainer';
import {createSchema} from 'rescape-sample-data'
import {queries} from './MainContainer';
import * as R from 'ramda';

// Test this container
const [Container] = eMap([MainContainer]);
// Find this React component
const componentName = 'Main';
// Find this class in the data renderer
const childClassDataName = c.main;
const childClassLoadingName = c.mainLoading;
const childClassErrorName = c.mainError;
const queryConfig = queries.allUserRegions;
const initialState = sampleInitialState;
// Use this to make a query that errors
const errorMaker = parentProps => R.set(R.lensPath(['user', 'id']), 'foo', parentProps);
const schema = createSchema();

describe('MainContainer', () => {
  const {testMapStateToProps} = apolloContainerTests({
    initialState,
    schema,
    Container,
    componentName,
    childClassDataName,
    childClassLoadingName,
    childClassErrorName,
    queryConfig,
    chainedParentPropsTask,
    mapStateToProps,
    errorMaker
  });
  // No Apollo, just run one test
  test('testMapStateToProps', testMapStateToProps);
});