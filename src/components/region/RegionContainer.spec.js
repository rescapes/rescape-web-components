import {
  propsFromSampleStateAndContainer
} from 'rescape-helpers-component';
import {eMap} from 'rescape-helpers-component';
import * as R from 'ramda';
import {apolloContainerTests} from 'rescape-helpers-component';
import makeSchema from 'schema/schema';
import {sampleInitialState} from 'helpers/testHelpers';
import {c} from 'components/region/Region';
import RegionContainer, {queries, mapStateToProps} from 'components/region/RegionContainer';
import {chainedParentPropsTask} from 'components/region/RegionContainer.sample';

const schema = makeSchema();

// Test this container
const [Container] = eMap([RegionContainer]);
// Find this React component
const componentName = 'Region';
// Find this class in the data renderer
const childClassDataName = c.regionMapboxOuter;
// Find this class in the loading renderer
const childClassLoadingName = c.regionLoading;
// Find this class in the error renderer
const childClassErrorName = c.regionError;
const queryConfig = queries.region;
const errorMaker = parentProps => R.set(R.lensPath(['region', 'id']), 'foo', parentProps);

describe('RegionContainer', () => apolloContainerTests({
    initialState: sampleInitialState,
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
  })
);
