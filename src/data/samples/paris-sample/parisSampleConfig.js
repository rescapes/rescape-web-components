import {environmentConfig} from 'environments/testConfig';
import regions from './parisRegions.sample'
import users from './parisUsers.sample'
import {mergeDeep} from 'rescape-ramda';
import {applyRegionsToUsers} from 'data/configHelpers';

export const parisSampleConfig = mergeDeep(environmentConfig, {
  regions,
  // Give each users all regions for simplicity
  users: applyRegionsToUsers(regions, users)
});
