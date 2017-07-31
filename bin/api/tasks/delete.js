// Delete

const fs = require('fs-extra');
const path = require('path');
const request = require('request');

/**
 * Deletes a specified intent from the cache when it exists.
 * The purpose of this method is to remove an associated JSON file when it
 * is present by looking at the supplied intent name. This method is used
 * for cleaning purposes to ensure cache is removed so that updates may
 * be performed
 *
 * @param  {Object} intent the intent object
 * @param {String} intent.name the name assigned to the intent
 * @param  {String} cachePath the path to the cache directory
 * @return {Promise} resolves/rejects on completion
 * @private
 */
exports.deleteIntentFromCache = (intent, cachePath) => {
  const deletePath = path.join(cachePath, '/intents/', `${intent.name}.json`);

  return new Promise((resolve, reject) => {
    fs.remove(deletePath)
      .then(() => resolve())
      .catch(err => reject(err));
  });
};

/**
 * Deletes a supplied intent. This method is used to remove an intent from
 * api.ai, cache, or both. If the intent was found on api.ai, we delete it
 * then remove the associated cache file if it exists. If the intent
 * does not exist on api.ai, we only attempt to remove the cache.
 *
 * @param {Object} intent the intent object
 * @param {String} intent.id the unique ID of the intent on api.ai
 * @param {Boolean} match  whether or not we have a match result on api.ai
 * @param {Object} props the core properties
 * @param {String} props.cache the cache path in the users project
 * @param {String} props.apiURL the URL for data submission
 * @param {String} props.apiToken the supplied api.ai developer token, used
 * @return {Promise} resolves/rejects on completion
 * @private
 */
exports.deleteIntent = (intent, match, props) => {
  const deleteURL = `${props.apiURL}/intents/${intent.id}`;

  return new Promise((resolve, reject) => {
    if (match) {
      request.delete({
        url: deleteURL,
        auth: { bearer: props.apiToken },
        json: true,
      }, (err, out, stat) => {
        if (err) {
          reject(err);
          return;
        }

        if (!stat.status || stat.status.code !== 200) {
          reject(stat);
          return;
        }

        // Delete the intent from cache
        exports.deleteIntentFromCache(intent, props.cache)
          .then(() => resolve())
          .catch(writeErr => reject(writeErr));
      });
    } else {
      // Skip attempting to delete from api.ai when no match was found,
      // delete the intent from cache
      exports.deleteIntentFromCache(intent, props.cache)
        .then(() => resolve())
        .catch(writeErr => reject(writeErr));
    }
  });
};

/**
 * Deletes a supplied entity. This method is used to remove an entity from
 * api.ai only (cache deletion is not required because entity data is stored
 * in a single file). If the entity was found on api.ai, we delete it
 *
 * @param {Object} entity the entity object
 * @param {String} entity.id the unique ID of the entity on api.ai
 * @param {Boolean} match  whether or not we have a match result on api.ai
 * @param {Object} props the core properties
 * @param {String} props.cache the cache path in the users project
 * @param {String} props.apiURL the URL for data submission
 * @param {String} props.apiToken the supplied api.ai developer token, used
 * @return {Promise} resolves/rejects on completion
 * @private
 */
exports.deleteEntity = (entity, match, props) => {
  const deleteURL = `${props.apiURL}/entities/${entity.id}`;

  return new Promise((resolve, reject) => {
    if (match) {
      request.delete({
        url: deleteURL,
        auth: { bearer: props.apiToken },
        json: true,
      }, (err, out, stat) => {
        if (err) {
          reject(err);
          return;
        }

        if (!stat.status || stat.status.code !== 200) {
          reject(stat);
        }

        resolve();
      });
    } else {
      resolve();
    }
  });
};

/**
 * Creates the task list of intents to delete
 *
 * @param {Array} list the list of items to remove
 * @param {Object} props the core properties
 * @param {Array} entries the list of entries loaded from api.ai
 * @return {Array} returns an array of tasks
 * @private
 */
exports.createTasks = (list, props, entries, deleteMethod) => list.reduce(
  (taskList, entry) => {
    const match = entries.find(item => item.name === entry.name);
    const input = match ||
      { name: typeof entry === 'string' ? entry : entry.name };

    taskList.push(exports[deleteMethod](input, match, props));
    return taskList;
  }, []);

/**
 * Delete a list of intents from both api.ai and the cache. This method
 * is used as part of the `clean` task set, whose purpose is to manage
 * data that is populated into api.ai
 *
 * @param {Array} list the list of items to remove
 * @param {Object} props the core properties
 * @param {Array} intents the list of intents loaded from api.ai
 * @return {Promise} resolves/rejects on completion
 * @private
 */
exports.deleteIntents = (list, props, intents) => {
  const tasks = exports.createTasks(list, props, intents, 'deleteIntent');
  return new Promise((resolve, reject) => {
    Promise
      .all(tasks)
      .then(() => resolve())
      .catch(err => reject(err));
  });
};

/**
 * Delete a list of entities from both api.ai and the cache. This method
 * is used as part of the `clean` task set, whose purpose is to manage
 * data that is populated into api.ai
 *
 * @param {Array} list the list of items to remove
 * @param {Object} props the core properties
 * @param {Array} entities the list of entities loaded from api.ai
 * @return {Promise} resolves/rejects on completion
 * @private
 */
exports.deleteEntities = (list, props, entities) => {
  const tasks = exports.createTasks(list, props, entities, 'deleteEntity');
  return new Promise((resolve, reject) => {
    Promise
      .all(tasks)
      .then(() => resolve())
      .catch(err => reject(err));
  });
};
