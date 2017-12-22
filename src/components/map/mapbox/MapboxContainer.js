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
import {viewportSelector} from 'selectors/mapboxSelectors';
import {makeActiveUserAndSettingsSelector} from 'selectors/storeSelectors';
import {createSelector} from 'reselect';
import {loadingCompleteStatus, makeTestPropsFunction} from 'helpers/componentHelpers';
import {mergeDeep, throwing} from 'rescape-ramda';
import Mapbox from './Mapbox';
import * as R from 'ramda';
import {graphql} from 'react-apollo';
import {gql} from 'apollo-client-preset';


/**
 * Selects the current user from state
 * and the Viewport for the region in the props
 * @returns {Object} The props
 */
export const mapStateToProps = (state, props) => {
  return createSelector(
    [
      makeActiveUserAndSettingsSelector(),
      makeMergeDefaultStyleWithProps(),
      viewportSelector
    ],
    (userAndSettings, style, viewport) => ({
      data: R.merge(
        userAndSettings,
        {viewport}
      ),
      style
    })
  )(state, props);
};

export const mapDispatchToProps = (dispatch, ownProps) => {
  return bindActionCreators({
    onChangeViewport
    //hoverMarker,
    //selectMarker
  }, dispatch);
};



/**
 * All queries used by the container
 * @type {{region: {query: *, args: {options: (function({data: *}): {variables: {regionId}}), props: (function({data: *, ownProps?: *}): *)}}}}
 */
export const queries = {
  /**
   * Expect a region stub with an id and resolves the full region from the data layer
   */
  region: {
    query: regionQuery,
    args: {
      options: ({data: {region}}) => ({
        variables: {
          regionId: region.id
        }
      }),
      props: ({data, ownProps}) => mergeDeep(
        ownProps,
        {data}
      )
    }
  }
};

/**
 * Query
 * Prerequisites:
 *   A User in context
 * Resolves:
 *  The Regions of the User
 * Without prerequisites:
 *  Skip render
 */
const Query = ` 
    query geojson($regionId: String!) {
        store {
            region(id: $regionId) {
                geojson {
                }
            },
        }
    }
`;


// Create the GraphQL Container.
// TODO We should handle all queries in queries here
const ContainerWithData = graphql(
  gql`${queries.region.query}`,
  queries.region.args)
(Mapbox);

// Returns a function that expects state and ownProps for testing
export const testPropsMaker = makeApolloTestPropsFunction(mapStateToProps, mapDispatchToProps, queries.region);

// Using R.merge to ignore ownProps, which were already merged by mapStateToProps
export default connect(mapStateToProps, mapDispatchToProps, R.merge)(ContainerWithData);

