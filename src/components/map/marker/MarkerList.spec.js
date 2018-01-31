import React from 'react';
import {shallow} from 'enzyme';
import {reqPathThrowing} from 'rescape-ramda';
import {mapStateToProps} from './MarkerListContainer';
import {geojsonByType} from 'rescape-helpers-component';

import {sampleConfig, initialState} from 'rescape-sample-data'
import * as R from 'ramda';
import MarkerList from './MarkerList'
jest.mock('query-overpass');
const state = initialState(config);
const currentKey = reqPathThrowing(['regions', 'currentKey'], state);
import geojson from 'queryOverpassResponse'.LA_SAMPLE;
const e = React.createElement;

const props = mapStateToProps(state, {
    region: R.set(
        R.lensProp('geojson'),
        geojsonByType(geojson),
        reqPathThrowing(['regions', currentKey], state)
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
