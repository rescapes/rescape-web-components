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
import {mergeDeep, reqStrPathThrowing} from 'rescape-ramda';
import Sankey from './Sankey';
import * as R from 'ramda';
import {graphql} from 'react-apollo';
import {gql} from 'apollo-client-preset';

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
    (userAndSettings, defaultStyle, {viewport, ...mapbox}) => {
      return {
        data: R.mergeAll([
          userAndSettings,
          // Mapbox is selected separately to combine region.mapbox with settings.mapbox
          // Viewport is combined with other properties in the react-map-gl component, hence separated here
          {
            viewport,
            mapbox
          },
          data
        ]),
        style: R.merge(defaultStyle, style)
      };
    }
  )(state, props);
};

export const mapDispatchToProps = (dispatch, ownProps) => {
  return bindActionCreators({
    // react-map-gl renamed this, redux-map-gl did not
    // add the region to the payload so the reducer knows what region we are
    onViewportChange: newViewport => {
      // Debounce to reduce actions. Debounce works by adding a meta: {debounce ...} to to the event arguments,
      // which will be interpreted by redux-debounced middleware
      return R.set(
        R.lensProp('meta'),
        {
          debounce: {
            key: 'map/CHANGE_VIEWPORT',
            time: 10
          }
        },
        onChangeViewport(
          R.set(R.lensProp('region'), reqStrPathThrowing('region', ownProps), newViewport)
        )
      );
    }
    /*
    onSankeyFilterChange: e => {
      return e;
    }
    */
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
                              isGeneralized
                              type
                              geometry {
                                type
                                coordinates
                              }
                              name
                              value
                          }
                          links {
                            source 
                            target 
                            value
                          }
                      }
                      stages {
                        key
                        name
                        target
                      }
                      stageKey
                      valueKey
                    }
                }
            },
        }
    }
`;

/**
 * Mutates the selected filterNodeCategories by passing the category and value that have changed
 * @type {string}
 */
const filterSankeyNodesMutation = `
    mutation filterSankeyNodes($filterNodeCategory: String!, $filterNodeValue: Boolean!) {
        filterSankeyNodes(filterNodeCategory: $filterNodeCategory, filterNodeValue: $filterNodeValue) {
          material
        }
    }
`;

const onViewportChangeMutation = `
  mutation onViewportChange() {
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
        errorPolicy: 'all'
      }),
      props: ({data, ownProps}) => {
        let filteredData = data;
        if (data.store) {
          const userRegion = R.find(R.eqProps('id', ownProps.data.region), ownProps.data.user.regions);
          const selectedSankeyNodeCategories =
            R.filter(
              R.identity,
              R.defaultTo({}, R.view(R.lensPath(['geojson', 'sankey', 'selected']), userRegion)));

          filteredData = R.length(selectedSankeyNodeCategories) ?
            R.over(
              R.lensPath(['store', 'region', 'geojson', 'sankey', 'graph', 'nodes']),
              nodes => R.map(node => R.merge(
                node,
                {
                  isVisible: R.or(
                    // Not there
                    R.compose(R.isNil, R.prop(node.material))(selectedSankeyNodeCategories),
                    // There and true
                    R.contains(node.material, R.keys(selectedSankeyNodeCategories))
                  )
                }
              ), nodes || []),
              data
            ) : data;
        }
        return mergeDeep(
          ownProps,
          {data: filteredData}
        );
      }
    }
  },
  filterSankeyNodes: {
    query: filterSankeyNodesMutation,
    args: {
      options: {
        errorPolicy: 'all'
      },
      props: ({mutate}) => ({
        onSankeyFilterChange:
          (filterNodeCategory, filterNodeValue) => mutate({variables: {filterNodeCategory, filterNodeValue}})
      })
    }
  }
};

// Create the GraphQL Container.
// TODO We should handle all queries in queries here
const ContainerWithData = R.compose(
  graphql(
    gql`${queries.geojson.query}`,
    queries.geojson.args
  ),
  graphql(
    gql`${queries.filterSankeyNodes.query}`,
    queries.filterSankeyNodes.args
  )
)(Sankey);

// Using R.merge to ignore ownProps, which were already merged by mapStateToProps
export default connect(mapStateToProps, mapDispatchToProps, R.merge)(ContainerWithData);

