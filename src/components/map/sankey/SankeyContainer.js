/**
 * Created by Andy Likuski on 2017.02.06
 * Copyright (c) 2017 Andy Likuski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {onChangeViewport} from 'redux-map-gl';
import {makeMergeDefaultStyleWithProps} from 'selectors/styleSelectors';
import {mapboxSelector} from 'selectors/mapboxSelectors';
import {makeActiveUserAndSettingsSelector} from 'selectors/storeSelectors';
import {createSelector} from 'reselect';
import {makeApolloTestPropsFunction} from 'helpers/componentHelpers';
import {mergeDeep, throwing} from 'rescape-ramda';
import Sankey from './Sankey';
import * as R from 'ramda';
import {graphql} from 'react-apollo';
import {gql} from 'apollo-client-preset';

const {reqStrPath} = throwing;

/**
 * Selects the current user from state
 * and the Viewport for the region in the props
 * @returns {Object} The props
 */
export const mapStateToProps = (state, props) => {
  const {style, ...data} = props;
  return createSelector(
    [
      makeActiveUserAndSettingsSelector(),
      makeMergeDefaultStyleWithProps(),
      mapboxSelector
    ],
    (userAndSettings, defaultStyle, {viewport, ...mapbox}) => ({
      data: R.mergeAll([
        userAndSettings,
        // Mapbox is selected separately to combine region.mapbox with settings.mapbox
        // Viewport is combined with other properties in the react-map-gl component, hence separated here
        {viewport, mapbox},
        data,
      ]),
      style: R.merge(defaultStyle, style)
    })
  )(state, props);
};

export const mapDispatchToProps = (dispatch, ownProps) => {
  return bindActionCreators({
    // react-map-gl renamed this, redux-map-gl did not
    // add the region to the payload so the reducer knows what region we are
    onViewportChange: mapState => {
      // Debounce to reduce actions
      return R.set(
        R.lensProp('meta'),
        {
          debounce: {
            key: 'map/CHANGE_VIEWPORT',
            time: 10
          }
        },
        onChangeViewport(
          R.set(R.lensProp('region'), reqStrPath('region', ownProps), mapState)
        )
      );
    },
    onSankeyFilterChange: e => {
      return e
    }
    //hoverMarker,
    //selectMarker
  }, dispatch);
};


/**
 * Query
 * Prerequisites:
 *   A Region
 * Resolves:
 *  The geojson of the Region
 * Without prerequisites:
 *  Skip render
 */
const geojsonQuery = `
    query geojson($regionId: String!) {
        store {
            region(id: $regionId) {
                id
                geojson {
                    osm {
                        features {
                            id
                            type
                            geometry {
                                type
                                coordinates
                            }
                            properties
                        }
                    }
                    sankey {
                      graph {
                          nodes {
                              siteName
                              location
                              coordinates
                              junctionStage
                              annualTonnage
                              index
                              material
                              type
                              geometry {
                                type
                                coordinates
                              }
                          }
                          links {
                            source 
                            target 
                            value
                          }
                      }
                          
                    }
                }
            },
        }
    }
`;

/**
 * All queries used by the container
 */
export const queries = {
  /**
   * Expects a region with an id and resolves geojson of the region
   */
  geojson: {
    query: geojsonQuery,
    args: {
      options: ({data: {region}}) => ({
        variables: {
          regionId: region.id
        },
        errorPolicy: 'none'
      }),
      props: ({data, ownProps}) => mergeDeep(
        ownProps,
        {data}
      )
    }
  }
};

// Create the GraphQL Container.
// TODO We should handle all queries in queries here
const ContainerWithData = graphql(
  gql`${queries.geojson.query}`,
  queries.geojson.args
)
(Sankey);

// Returns a function that expects state and ownProps for testing
export const testPropsMaker = makeApolloTestPropsFunction(mapStateToProps, mapDispatchToProps, queries.geojson);

// Using R.merge to ignore ownProps, which were already merged by mapStateToProps
export default connect(mapStateToProps, mapDispatchToProps, R.merge)(ContainerWithData);

