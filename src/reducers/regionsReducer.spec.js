import reducer from './regionsReducer';
//import {actions} from './geojsonReducer'
import {Map} from 'immutable';
import {createSampleConfig} from 'rescape-sample-data'
import createInitialState from 'initialState';
import {reqPathThrowing} from 'rescape-ramda';
import * as R from 'ramda';

const sampleConfig = createSampleConfig();

describe('mabpox reducer', () => {
  test('should return the initial state', () => {
    const state = createInitialState(sampleConfig);
    expect(
      Map(reducer(
        state.regions,
        {})
      ).toJS()
    ).toMatchSnapshot();
  });
  test('should update the current region', () => {
    const state = createInitialState(sampleConfig);
    expect(
      reducer(
        state.regions,
        {
          type: actions.FETCH_TRANSIT_SUCCESS,
          value: {
            type: 'FeatureCollection',
            generator: 'overpass-turbo',
            copyright: 'The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.',
            timestamp: '2017-04-06T22:46:03Z',
            features: []
          }
        }
      )
    ).toMatchSnapshot();
  });
  // This is really internal to redux-map-gl's reducer, but good to have here to document what
  // it does
  test('should handle CHANGE_VIEWPORT', () => {
    const state = initialState(sampleConfig);
    const region = R.head(R.values(state.regions))
    const regionId = region.id
    const viewport = {
      bearing: 0,
      isDragging: false,
      latitude: 5,
      longitude: 6,
      pitch: 40,
      startDragLngLat: null,
      zoom: 4,
      region
    };
    expect(
      reqPathThrowing(
        [regionId, 'mapbox', 'viewport'],
        reducer(
          state.regions,
          {
            type: 'map/CHANGE_VIEWPORT',
            payload: {
              mapState: viewport
            }
          })
      ).toJS()
    ).toEqual(
      viewport
    );
  });
});

