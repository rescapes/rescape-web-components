import {gql} from 'apollo-client-preset';
import {graphql} from 'react-apollo';
import {connect} from 'react-redux';
import Current from './Current'
import * as R from 'ramda';
import {createSelector} from 'reselect';
import {makeActiveUserAndSelectedRegionStateSelector} from 'selectors/storeSelectors';
import {makeBrowserProportionalDimensionsSelector} from 'selectors/styleSelectors';
import {onlyOneRegion, onlyOneRegionId} from 'selectors/regionSelectors';
import {mergeDeep, throwing} from 'rescape-ramda'
const {onlyOneValue} = throwing


/**
 * Combined selector that:
 * Limits the state to the active user and region. This merges props with the state immediately, overriding the
 * state with anything in props.
 * It does not pass props on to sub selectors as a separate argument
 * Limits the component dimensions to the browser.
 * @param {Object} state The redux state
 * @param {Object} [props] The optional props to override the state.
 * @returns {Object} The state and own props mapped to props for the component
 */
export const mapStateToProps = (state, props) =>
  createSelector(
    [
      (state, props) => {
        return makeActiveUserAndSelectedRegionStateSelector()(mergeDeep(state, R.defaultTo({}, props)));
      },
      makeBrowserProportionalDimensionsSelector()
    ],
    (activeUserAndRegion, dimensions) =>
      ({
        // Merge the browser dimensions with the props
        // props from the parent contain style instructions
        // TODO we need to set width and height proportional to the browser dimensions, not equal to
        style: dimensions,
        views: {
          // child component
          region: {
            // region prop
            region: onlyOneRegion(activeUserAndRegion)
          }
        }
      })
  )(state, props);

/**
 * Query
 * Prerequisites:
 *   A User in context
 * Resolves:
 *  The Regions of the User
 * Without prerequisites:
 *  Skip render
 */
const query = gql`
    query region($regionId: String!) {
        store {
            region(id: $id) {
                id
                name
            },
        }
    }
`;

const ContainerWithData = graphql(query, {
  options: (props) => ({
    // Options are computed from `props` here.
    variables: {
      regionId: onlyOneRegionId(props)
    }
  }),
  props: ({data}) => ({
    store: data.store,
    loading: data.loading,
    data
  })
})
(Current);

const CurrentContainer = connect(
  mapStateToProps
)(ContainerWithData);

export default CurrentContainer;
