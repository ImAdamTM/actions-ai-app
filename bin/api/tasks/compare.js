// Compare

const path = require('path');
const fs = require('fs-extra');
const debug = require('../../lib/util/debug')('api:compare');

/**
 * Compares the supplied intent with the local cache. This is to avoid
 * unnecessary API calls
 *
 * @param {Object} intent the input intent object to compare
 * @param {String} intent.name the unique name of the intent
 * @return {Promise} resolves on completion
 * @private
 */
exports.compareIntentWithCache = (intent, cachePath) => {
  const inputPath = path.join(cachePath, '/intents/', `${intent.name}.json`);

  return new Promise((resolve) => {
    fs.ensureFile(inputPath, (file, err) => {
      if (err) {
        debug(err);
        resolve(null);
      }

      fs
        .readJson(inputPath)
        .then((res) => {
          if (JSON.stringify(intent) === JSON.stringify(res)) {
            resolve(true);

            return;
          }

          resolve(false);
        })
        .catch(() => resolve(false));
    });
  });
};

/**
 * Compares the supplied entities with the local cache. This is to avoid
 * unnecessary API calls
 *
 * @param {Array} entities the array of entities for injection
 * @param {String} cachePath the user defined cache location
 * @return {Promise} resolves on completion
 * @private
 */
exports.compareEntitiesWithCache = (entities, cachePath) => {
  const inputPath = path.join(cachePath, 'entities.json');

  return new Promise((resolve) => {
    fs.ensureFile(inputPath, (file, err) => {
      if (err) {
        debug(err);
        resolve(null);
        return;
      }

      fs
        .readJson(inputPath)
        .then((res) => {
          if (JSON.stringify(entities) === JSON.stringify(res)) {
            resolve(true);

            return;
          }

          resolve(false);
        })
        .catch(() => resolve(false));
    });
  });
};
