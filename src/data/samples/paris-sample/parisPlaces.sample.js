
/**
 * @typedef {Object} Place
 * @property {string} id primary station code for the Place. This is used to id stops uniquely in conjunction
 * with which stop it is of the place (e.g. code SFC could be used for stops (SFC-Transbay, SFC-4thAndKing).
 * If another station code exists for a station like SFW for San Franicsco Fisherman's Warf, it could override
 * the automatically Stop id created from this id.
 * @property {number} label name of the Place
 */

export default {
  LOS_ANGELES: {id: 'LAX', label: 'Los Angeles'},
  OAKLAND: {id: 'OAK', label: 'Oakland'},
  PLEASANTON: {id: 'PLS', label: 'Pleasanton'},
  RENO: {id: 'REN', label: 'Reno'},
  SACRAMENTO: {id: 'SAC', label: 'Sacramento'},
  SAN_FRANCISCO: {id: 'SFC', label: 'San Francisco'},
  SUISON_FAIRFIELD: {id: 'SUI', label: 'Suison-Fairfield'},
  STOCKTON: {id: 'SKN', label: 'Stockton'},
  TRUCKEE: {id: 'TRU', label: 'Truckee'}
};
