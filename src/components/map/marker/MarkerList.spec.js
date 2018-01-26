import React from 'react';
import {shallow} from 'enzyme';
import {reqPath} from 'rescape-ramda'.throwing;
import {mapStateToProps} from './MarkerListContainer';
import {geojsonByType} from 'rescape-helpers';

import {sampleConfig} from 'data/samples/sampleConfig';
import initialState from 'data/initialState'
import * as R from 'ramda';
import MarkerList from './MarkerList'
jest.mock('query-overpass');
const state = initialState(config);
const currentKey = reqPath(['regions', 'currentKey'], state);
import geojson from 'queryOverpassResponse'.LA_SAMPLE;
const e = React.createElement;

const props = mapStateToProps(state, {
    region: R.set(
        R.lensProp('geojson'),
        geojsonByType(geojson),
        reqPath(['regions', currentKey], state)
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
