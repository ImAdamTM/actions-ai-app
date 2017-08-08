// Write

const path = require('path');
const fs = require('fs-extra');

/**
 * Write the entities to cache after an update has occurred successfully
 *
 * @param {Object} intent the intent data to put into cache
 * @param {String} intent.name the unique name of the intent
 * @param {String} cachePath the user defined cache location
 * @return {Promise} resolves/rejects on completion
 * @private
 */
exports.writeIntentToCache = (intent, cachePath) => {
  const outputPath = path.join(cachePath, '/intents/', `${intent.name}.json`);

  return new Promise((resolve, reject) => {
    fs
      .writeJson(outputPath, intent)
      .then(() => resolve())
      .catch(err => reject(err));
  });
};

/**
 * Write the entities to cache after an update has occurred successfully
 *
 * @param {Array} entities the entities data to put into cache
 * @param {String} cachePath the user defined cache location
 * @return {Promise} resolves/rejects on completion
 * @private
 */
exports.writeEntitiesToCache = (entities, cachePath) => {
  const outputPath = path.join(cachePath, 'entities.json');

  return new Promise((resolve, reject) => {
    fs
      .writeJson(outputPath, entities)
      .then(() => resolve())
      .catch(err => reject(err));
  });
};
