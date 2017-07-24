// Clean

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const debug = require('../../lib/util/debug')('api:clean');
const {
  deleteIntents,
  deleteEntities,
} = require('./delete');

/**
 * Returns the list of files in a given directory, with the file extensions
 * stripped (returning only the list of file names)
 *
 * @param {String} folder the folder path name
 * @param {String} cachePath the cache location defined by the user
 * @return {Array} the list if files (with the extension removed)
 * @private
 */
exports.getCachedDirectoryList = (folder, cachePath) => {
  const dir = path.join(cachePath, folder);
  fs.ensureDirSync(dir);

  return fs.readdirSync(dir).map(filename => filename.replace(/\.[^/.]+$/, ''));
};

/**
 * Gets a list of items from a cached json data set
 * @param {String} filepath the path to the file, relative to the cache path
 * @param {String} cachePath the cache location defined by the user
 * @return {Promise} resolves on completion
 * @private
 */
exports.getCachedFileList = (filepath, cachePath) => {
  const inputPath = path.join(cachePath, filepath);

  return new Promise((resolve, reject) => {
    fs.ensureFile(inputPath, (file, err) => {
      if (err) {
        debug(err);
        reject(err);
        return;
      }

      fs.readJson(inputPath)
        .then((res) => {
          if (!Array.isArray(res)) {
            resolve([]);
            return;
          }

          resolve(res.map(entity => entity.name));
        })
        .catch(() => {
          resolve([]);
        });
    });
  });
};

/**
 * Get the list of items to be cleaned on api.ai
 *
 * @param {Object} props the core input properties
 * @param {String} props.cache the cache location defined by the user
 * @param {Map} props.intents the maps of intents to inject
 * @param {Boolean} props.cleanForceSync whether or not we are forcing api.ai
 * @param {Array} intents the array of intents loaded from api.ai
 * to completely sync to the local (delete any intents on api.ai that do not
 * exist in the application)
 * @return {Array} the list of intents to be cleaned
 * @private
 */
exports.getCleanList = (props, type, input, cached) => {
  let remove = cached.reduce((list, next) => {
    if (!props[type].get(next)) {
      list.push({
        name: next,
      });
    }
    return list;
  }, []);

  if (props.cleanForceSync) {
    // If forcing api.ai to be in sync, flag any entries on api.ai that
    // do not exist in local
    const remoteRemove = input.reduce((list, next) => {
      if (!props[type].get(next.name)) {
        list.push({
          id: next.id,
          name: next.name,
        });
      }

      return list;
    }, []);

    remove = remove.concat(remoteRemove);
  }

  // Strip duplicates & return
  return remove.filter((item, index, self) =>
    self.findIndex(t => t.name === item.name) === index);
};

/**
 * Clean the intents
 *
 * @param {Object} props the core input properties
 * @param {Array} intents the array of intents loaded from api.ai
 * @return {Promise} returns the `deleteIntents` call, which resolves/rejects
 * on completion
 * @private
 */
exports.cleanIntents = (props, intents) => {
  const cached = exports.getCachedDirectoryList('intents', props.cache);
  const remove = exports.getCleanList(props, 'intents', intents, cached);
  const debugSinglePlural = remove.length === 1 ? 'intent' : 'intents';
  const debugInfo =
    `Cleaning ${chalk.bold.magenta(remove.length)} ${debugSinglePlural}...`;
  const debugList = `${
    remove.map(intent => `\r\n- ${chalk.bold.yellow(intent.name)}`)}`;

  debug(debugInfo + debugList);

  return deleteIntents(remove, props, intents);
};

/**
 * Clean the entities
 *
 * @param {Object} props the core input properties
 * @param {Array} entities the array of entities loaded from api.ai
 * @return {Promise} returns the `deleteEntities` call, which resolves/rejects
 * on completion
 * @private
 */
exports.cleanEntities = (props, entities) => new Promise((resolve, reject) => {
  exports.getCachedFileList('entities.json', props.cache)
    .then((cached) => {
      const remove = exports.getCleanList(props, 'entities', entities, cached);
      const debugSinglePlural = remove.length === 1 ? 'entity' : 'entities';
      const debugInfo =
        `Cleaning ${chalk.bold.magenta(remove.length)} ${debugSinglePlural}...`;
      const debugList = `${
        remove.map(intent => `\r\n- ${chalk.bold.yellow(intent.name)}`)}`;

      debug(debugInfo + debugList);

      deleteEntities(remove, props, entities)
        .then(() => resolve())
        .catch(err => reject(err));
    })
    .catch((err) => {
      reject(err);
    });
});
