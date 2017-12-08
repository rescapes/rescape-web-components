const {gql} = require('apollo-client-preset');
const {graphql} = require('react-apollo');
const {connect} = require('react-redux');
const Current = require('./Current').default;
const R = require('ramda');
const {createSelector} = require('reselect');
const {makeActiveUserAndSelectedRegionStateSelector} = require('selectors/storeSelectors');
const {makeBrowserProportionalDimensionsSelector} = require('selectors/styleSelectors');
const {onlyOneRegionId} = require('selectors/regionSelectors');
const {mergeDeep, throwing: {onlyOneValue}} = require('rescape-ramda');


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
const mapStateToProps = module.exports.mapStateToProps = (state, props) =>
  createSelector(
    [
      (state, props) => {
        return makeActiveUserAndSelectedRegionStateSelector()(mergeDeep(state, R.defaultTo({}, props)));
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

module.exports.default = CurrentContainer;
