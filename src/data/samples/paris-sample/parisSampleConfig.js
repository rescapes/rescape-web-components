const {environmentConfig} = require('environments/testConfig');
const regions = require('./parisRegions.sample').default;
const users = require('./parisUsers.sample').default;
const {mergeDeep} = require('rescape-ramda');
const {applyRegionsToUsers} = require('data/configHelpers');

module.exports.parisSampleConfig = mergeDeep(environmentConfig, {
  regions,
  // Give each users all regions for simplicity
  users: applyRegionsToUsers(regions, users)
});
