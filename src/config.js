export default {
  // Required element in the config. We probably want to put a global region here
  regions: {

  },
  // Required element in the config. We probably want to put an admin user here or further up in one of the env configs
  users: {

  },
  // Settings is merged into the overall application state
  settings: {
    api: {
      // TODO how do we configure this for a live server vs dev server? Why not use the env configs?
      url: 'http://localhost:8000/api/graphql',
      authTokenKey: 'default_test_api_key',
    },
    // Overpass API configuration to play nice with the server's strict throttling
    overpass: {
      cellSize: 100,
      sleepBetweenCalls: 1000
    },
    markers: {
    },
    mapbox: {
      mapboxApiAccessToken: 'pk.eyJ1IjoiY2Fsb2NhbiIsImEiOiJjaXl1aXkxZjkwMG15MndxbmkxMHczNG50In0.07Zu3XXYijL6GJMuxFtvQg',
      // This will probably not be used unless we need to cluster something on the map
      iconAtlas: 'data/location-icon-atlas.png',
      // ditto
      showCluster: true,
      showZoomControls: true,
      // Universal Mapbox parameters to apply to any mapbox instance
      preventStyleDiffing: false
    },
    cycle: {
      drivers: {
        api: 'HTTP'
      }
    }
  }
}
