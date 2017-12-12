import {graphql} from 'react-apollo';
import {connect} from 'react-redux';
import Current from './Current'
import * as R from 'ramda';
import {createSelector} from 'reselect';
import {makeActiveUserAndRegionStateSelector, makeBrowserProportionalDimensionsSelector} from 'selectors/selectorHelpers';
import {mergeDeep} from 'rescape-ramda';


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
    query allUserRegions($userId: String!) {
        users(id: $userId) {
            regions(id: $id) {
                # Need minimum properties to let the user choose a region
                id
                name
                description
                # Is a region already selected
                isSelected
            }
        }
    }
`

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
        return makeActiveUserAndRegionStateSelector()(mergeDeep(state, R.defaultTo({}, props)));
      },
      makeBrowserProportionalDimensionsSelector()
    ],
    (activeUserAndRegion, dimensions) => R.merge(
      activeUserAndRegion,
      {
        // Merge the browser dimensions with the props
        // props from the parent contain style instructions
        // TODO we need to set width and height proportional to the browser dimensions, not equal to
        style: dimensions
      }
    )
  )(state, props);


const ContainerWithData = graphql(query, {
  props: ({ data: { loading, store } }) => ({
    store,
    loading,
  }),
})(Current);

const CurrentContainer = connect(
  mapStateToProps
)(ContainerWithData);

export default CurrentContainer;
