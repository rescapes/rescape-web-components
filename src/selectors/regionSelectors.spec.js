/**
 * Created by Andy Likuski on 2017.10.17
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const R = require('ramda');
const {
  STATUS: {IS_ACTIVE, IS_SELECTED},
} = require('./selectorHelpers');
const {
  makeRegionSelector, makeFeaturesByTypeSelector, makeRegionsSelector,
  makeGeojsonLocationsSelector, makeMarkersByTypeSelector
} = require('./regionSelectors')
const {
  mapboxSettingsSelector
} = require('./settingsSelectors')

describe('reselectHelpers', () => {
  const users = {
    blinky: {
      name: 'Blinky',
      [IS_ACTIVE]: true,
      regions: {
        pie: {
          id: 'pie',
          [IS_SELECTED]: true
        }
      }
    },
    pinky: {
      name: 'Pinky',
      regions: {
        pie: {
          id: 'pie',
          [IS_SELECTED]: true
        }
      }
    }
  };

  test('makeRegionSelector', () => {
    const locations = {
      features: [
        {
          id: 'node/3572156993',
          properties: {
            '@id': 'node/3572156993'
          }
        }
      ]
    };
    const features = [
      {
        type: 'Feature',
        id: 'way/29735335',
        properties: {
          '@id': 'way/29735335'
        }
      }
    ];
    const region = {
      geojson: {
        osm: {
          features
        },
        locations
      }
    };
    const expected =
      R.merge(region, {
        geojson: {
          osm: {
            features,
            featuresByType: makeFeaturesByTypeSelector()(region),
            locationsByType: makeMarkersByTypeSelector()(region)
          },
          locations
        }
      });
    expect(makeRegionSelector()(region)).toEqual(expected);
  });

  test('makeRegionsSelector', () => {
    const state = {
      regions: {
        foo: {},
        boo: {id: 'boo'}
      },
      users: {
        blinky: {
          [IS_ACTIVE]: true,
          regions: {foo: {id: 'foo'}, boo: {id: 'boo', [IS_SELECTED]: true}}
        },
        pinky: {}
      }
    };
    // only the selected region of the active user should be selected
    const expected = {
      boo: {
        id: 'boo',
        [IS_SELECTED]: true,
        // These are created by the derived data selectors
        geojson: {osm: {featuresByType: {}, locationsByType: {}}}
      }
    };
    expect(makeRegionsSelector()(state)).toEqual(expected);
  });

  const regionsState = {
    regions: {
      foo: {
        mapbox: {
          viewport: {some: 'thing'}
        },
        geojson: {
          some: 'thing',
          locations: {
            someLocation: 'ok'
          }
        }
      },
      boo: {
        mapbox: {
          viewport: {what: 'ever'}
        },
        geojson: {
          what: 'ever',
          locations: {
            someLocation: 'sure'
          }
        }
      }
    },
    users: {
      blinky: {
        [IS_ACTIVE]: true,
        regions: {foo: {id: 'foo'}, boo: {id: 'boo', [IS_SELECTED]: true}}
      }
    }
  };

  test('makeViewportsSelector', () => {
    const expected = {
      boo: {
        what: 'ever'
      }
    };
    const viewportSelector = makeViewportsSelector();
    expect(viewportSelector(regionsState)).toEqual(expected);
  });


  test('makeGeojsonLocationsSelector', () => {
    // Exepect the contents of the geojson.locations of the active region
    const expected = {
      boo: {
        someLocation: 'sure'
      }
    };
    const viewportSelector = makeGeojsonLocationsSelector();
    expect(viewportSelector(regionsState)).toEqual(expected);
  });

  test('mapboxSettingSelector', () => {
    const state = {
      settings: {
        mapbox: {
          showCluster: true,
          showZoomControls: true,
          perspectiveEnabled: true,
          preventStyleDiffing: false
        }
      }
    };
    const expected = {
      showCluster: true,
      showZoomControls: true,
      perspectiveEnabled: true,
      preventStyleDiffing: false
    };
    expect(mapboxSettingsSelector(state.settings)).toEqual(expected);
  });

});