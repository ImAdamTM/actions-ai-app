// Update

const chalk = require('chalk');
const request = require('request');
const debug = require('../../lib/util/debug')('api:update');
const {
  compareIntentWithCache,
  compareEntitiesWithCache,
} = require('./compare');
const { writeIntentToCache, writeEntitiesToCache } = require('./write');

/**
 * Update an individual intent.
 *
 * @param {Object} intent the precompiled intent object to insert into api.ai
 * @param {Object} intent.name the unique name of the intent
 * @param {String} updateID when an intent is inserted to api.ai we first
 * determine whether it matched a known intent already on api.ai, in which case
 * we use that generated ID to update
 * @param {Object} props the core input properties
 * @param {String} props.cache the cache path in the users project
 * @param {String} props.apiURL the URL for data submission
 * @param {String} props.apiToken the supplied api.ai developer token, used
 * to authenticate the submission
 * @return {Promise} resolves/rejects on completion
 * @private
 */
exports.updateIntent = (intent, updateID, props) =>
  new Promise((resolve, reject) => {
    const updateMethod = updateID ? request.put : request.post;
    const updateURL = updateID
      ? `${props.apiURL}/intents/${updateID}`
      : `${props.apiURL}/intents/`;

    compareIntentWithCache(intent, props.cache).then((matched) => {
      if (matched) {
        resolve('skipped');
        return;
      }

      debug('Updating intent:', chalk.bold.magenta(intent.name));

      updateMethod(
        {
          url: updateURL,
          auth: { bearer: props.apiToken },
          json: intent,
        },
        (err, out, stat) => {
          if (err) {
            reject(err);
            return;
          }

          if (!stat.status || stat.status.code !== 200) {
            reject(stat);
            return;
          }

          writeIntentToCache(intent, props.cache)
            .then(() => resolve())
            .catch(writeErr => reject(writeErr));
        });
    });
  });

/**
 * Updates the Entities. Unlike intents which may only be update on api.ai
 * one at a time, intents may be updated all at once. This method first checks
 * whether a cache exists for the entities and attempts to compare the input
 * data to cache (to know if something changed). If changes have occured then
 * we `PUT` the data into api.ai and update the local cache
 *
 * @param {Object} props the core input properties
 * @param {Map} props.entities the map of entities the application is injecting
 * @param {String} props.cache the cache path in the users project
 * @param {String} props.apiURL the URL for data submission
 * @param {String} props.apiToken the supplied api.ai developer token, used
 * @return {Promise} resolves/rejects on completion
 * @private
 */
exports.updateEntities = (props) => {
  const list = [];

  props.entities.forEach(entity => list.push(entity));

  return new Promise((resolve, reject) => {
    compareEntitiesWithCache(list, props.cache).then((matched) => {
      if (!matched && !list.length) {
        // Ensure entity cache is in sync
        writeEntitiesToCache(list, props.cache)
          .then(() => resolve('no update required'))
          .catch(writeErr => reject(writeErr));

        return;
      }

      if (matched) {
        resolve('skipped');
        return;
      }

      debug('Updating entities...');

      request.put(
        {
          url: `${props.apiURL}/entities`,
          auth: {
            bearer: props.apiToken,
          },
          json: list,
        },
        (err, out, stat) => {
          if (err) {
            reject(err);
            return;
          }

          if (!stat.status || stat.status.code !== 200) {
            reject(stat);
            return;
          }

          writeEntitiesToCache(list, props.cache)
            .then(() => resolve('success'))
            .catch(writeErr => reject(writeErr));
        });
    });
  });
};

/**
 * Updates the Intents. This method attempts to update api.ai with the intents
 * configured by the application. This method also checks whether or not
 * an intent with the same name exists on api.ai already which is used to
 * determine the request method (PUT/POST)
 *
 * @param {Object} props the core input properties
 * @param {Map} props.intents the map of intents the application is injecting
 * @param {Array} intents the array of intents loaded from api.ai
 * @return {Promise} resolves/rejects on completion
 * @private
 */
exports.updateIntents = (props, intents) => {
  const tasks = [];
  props.intents.forEach((intent) => {
    const match = intents.find(item => item.name === intent.name);

    tasks.push(exports.updateIntent(intent, match ? match.id : null, props));
  });
  return new Promise((resolve, reject) => {
    Promise.all(tasks).then(() => resolve('success')).catch(err => reject(err));
  });
};
