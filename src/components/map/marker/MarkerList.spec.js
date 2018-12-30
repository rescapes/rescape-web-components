import React from 'react';
import {shallow} from 'enzyme';
import {onlyOneValue, reqPathThrowing} from 'rescape-ramda';
import {mapStateToProps} from './MarkerListContainer';
import {geojsonByType} from 'rescape-helpers-component';
import {getCurrentConfig, privateConfig, createInitialState} from 'rescape-sample-data';
import * as R from 'ramda';
import MarkerList from './MarkerList';
import {LA_SAMPLE} from 'rescape-sample-data';
import {activeUserSelectedRegionsSelector} from 'rescape-apollo';

jest.mock('query-overpass');
const sampleConfig = getCurrentConfig(privateConfig);
const state = createInitialState(sampleConfig);
const regionId = onlyOneValue(activeUserSelectedRegionsSelector()).id
const e = React.createElement;

const props = mapStateToProps(state, {
  region: R.set(
    R.lensProp('geojson'),
    geojsonByType(LA_SAMPLE),
    reqPathThrowing(['regions', regionId], state)
  )
});

describe('MarkerList', () => {
  it('MarkerList can mount', () => {
    const wrapper = shallow(e(MarkerList, props));
    expect(wrapper).toMatchSnapshot();
  });
});

/*
TODO I don't know how to test this
 */
/*
it('MapGL call onLoad when provided', () => {
    const onLoad = jest.fn();

    const props = {onLoad, ...defaultProps};
    mount(<MapGL {...props} />);
    expect(onLoad).toBeCalledWith();
});
*/
