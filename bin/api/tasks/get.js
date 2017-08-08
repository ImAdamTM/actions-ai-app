// Get

const request = require('request');
const debug = require('../../lib/util/debug')('api:get');

/**
 * Load the `intent` list from api.ai. We use this to determine how intents
 * get updated
 *
 * @param {Object} props the core input properties
 * @param {String} props.apiURL the URL for data submission
 * @param {String} props.apiToken the supplied api.ai developer token, used
 * @return {Promise} resolves/rejects on completion
 * @private
 */
exports.getIntents = props =>
  new Promise((resolve, reject) => {
    request.get(
      {
        url: `${props.apiURL}/intents`,
        auth: {
          bearer: props.apiToken,
        },
        json: true,
      },
      (err, res, stat) => {
        if (err) {
          debug('API.AI error:', err);
          return reject(err);
        }

        if (!stat) {
          debug('API.AI error:', 'JSON result is undefined');
          return reject('No data');
        }

        if (stat.status && stat.status.code !== 200) {
          return reject(stat);
        }

        return resolve(stat);
      });
  });

/**
 * Load the `entity` list from api.ai. We use this to determine how entities
 * get updated
 *
 * @param {Object} props the core input properties
 * @param {String} props.apiURL the URL for data submission
 * @param {String} props.apiToken the supplied api.ai developer token, used
 * @return {Promise} resolves/rejects on completion
 * @private
 */
exports.getEntities = props =>
  new Promise((resolve, reject) => {
    request.get(
      {
        url: `${props.apiURL}/entities`,
        auth: {
          bearer: props.apiToken,
        },
        json: true,
      },
      (err, res, stat) => {
        if (err) {
          debug('API.AI error:', err);
          return reject(err);
        }

        if (!stat) {
          debug('API.AI error:', 'JSON result is undefined');
          return reject('No data');
        }

        if (stat.status && stat.status.code !== 200) {
          return reject(stat);
        }

        return resolve(stat);
      });
  });

/**
 * Load the `intent` and `entity` list from api.ai. We use this to determine
 * how intents and entities get updated
 *
 * @param {Object} props the core input properties
 * @return {Promise} resolves/rejects on completion
 * @private
 */
exports.getIntentsAndEntities = props =>
  new Promise((resolve, reject) => {
    Promise.all([exports.getIntents(props), exports.getEntities(props)])
      .then(([intents, entities]) => resolve({ intents, entities }))
      .catch(err => reject(err));
  });
