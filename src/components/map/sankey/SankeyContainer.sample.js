import {
  apolloTestPropsTaskMaker, parentPropsForContainerTask, propsFromParentPropsTask
} from 'helpers/helpers';
import {mapStateToProps, mapDispatchToProps, queries} from './SankeyContainer';
import {chainedSamplePropsTask as parentContainerSamplePropsTask} from 'components/region/RegionContainer.sample';
import Parent, {c as parentC} from 'components/region/Region';
import {parentPropsForContainerTask} from 'rescape-helpers-component'

/**
 * Returns a function that expects state and parentProps for testing and returns a Task that resolves the propsj
 */
export const samplePropsTaskMaker = apolloTestPropsTaskMaker(mapStateToProps, mapDispatchToProps, queries.geojson);

/**
 * Task returning sample parent props from all the way up the view hierarchy
 */
export const chainedParentPropsTask = parentPropsForContainerTask(parentContainerSamplePropsTask, Parent.views, parentC.Sankey);

/**
 * Task returning sample props from all the way up the view hierarchy
 */
export const chainedSamplePropsTask = propsFromParentPropsTask(chainedParentPropsTask, samplePropsTaskMaker);