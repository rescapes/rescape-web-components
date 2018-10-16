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
import {onViewportChange} from 'redux-map-gl';
import {makeMergeDefaultStyleWithProps} from 'rescape-apollo';
import {mapboxSelector, viewportSelector} from 'rescape-apollo';
import {makeActiveUserAndSettingsSelector} from 'rescape-apollo';
import {createSelector} from 'reselect';
import {makeApolloTestPropsFunction} from 'rescape-helpers-component';
import {mergeDeep} from 'rescape-ramda';
import Mapbox from './Mapbox';
import * as R from 'ramda';
import {v} from 'rescape-validate'
import PropTypes from 'prop-types'
import {composeGraphqlQueryDefinitions, queriesToGraphql} from 'helpers/helpers';

/**
 * Selects the current user from state
 * and the Viewport for the region in the props
 * @returns {Object} The props
 */
export const mapStateToProps = v((state, props) => {
  const {style, ...data} = props
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
        data
      ]),
      style: R.merge(defaultStyle, style)
    })
  )(state, props);
},
[
  ['state', PropTypes.shape().isRequired],
  ['props', PropTypes.shape().isRequired],
], 'mapStateToProps');

export const mapDispatchToProps = (dispatch, ownProps) => {
  return bindActionCreators({
    onViewportChange
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
 *  Skip render, although in the future we'll want to use this component to choose a region
 */
const geojsonQuery = `
    query geojson($regionId: String!) {
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
              }
        }
    }
`;

// TODO this needs to take viewport args
const viewportMutation = `
  mutation mutateViewport($isConnected: Boolean) {
    mutateViewport(isConnected: $isConnected) @client
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
        // Pass through error so we can handle it in the component
        errorPolicy: 'all'
      }),
      props: ({data, ownProps}) => mergeDeep(
        ownProps,
        {data}
      )
    }
  },
  // Mutate the Mapbox viewport, storing it in local cache
  mutateViewport: {
    query: viewportMutation,
    args: {
      options: {
        errorPolicy: 'all'
      },
      props: ({mutate}) => ({
        mutateViewport:
          (filterNodeCategory, filterNodeValue) => mutate({variables: {filterNodeCategory, filterNodeValue}})
      })
    }
  }
};

// Create the GraphQL Container.
const ContainerWithData = composeGraphqlQueryDefinitions(queries)(Mapbox);

// Using R.merge to ignore ownProps, which were already merged by mapStateToProps
export default connect(mapStateToProps, mapDispatchToProps, R.merge)(ContainerWithData);

