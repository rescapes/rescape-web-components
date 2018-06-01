
import {
  apolloTestPropsTaskMaker, asyncParentPropsTask
} from 'helpers/helpers';
import {mapStateToProps, mapDispatchToProps, queries} from './SankeyContainer';
import {chainedSamplePropsTask as parentContainerSamplePropsTask} from 'components/region/RegionContainer.sample'
import Parent, {c as parentC} from 'components/region/Region';

/**
 * Returns a function that expects state and parentProps for testing and returns a Task that resolves the propsj
 */
export const samplePropsTaskMaker = apolloTestPropsTaskMaker(mapStateToProps, mapDispatchToProps, queries.geojson);

/**
 * Sample chained props for a view of Sankey Container using Region as the parent
 * @param {String} viewName one of Region's views
 * @return {Task} A Task that resolves the parent container/component props and uses them to form this container's props
 */
export const chainedSamplePropsTask = asyncParentPropsTask(
  parentContainerSamplePropsTask, samplePropsTaskMaker, Parent.views, parentC.Sankey
);