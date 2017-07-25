// Api.ai

const chalk = require('chalk');
const Promise = require('../lib/util/promise-extra');
const {
  updateIntents,
  updateEntities,
} = require('./tasks/update');
const { getIntentsAndEntities } = require('./tasks/get');
const { cleanIntents, cleanEntities } = require('./tasks/clean');
const debug = require('../lib/util/debug')('api');

/**
 * Update API.AI with programmed entities and intents
 *
 * @param {Object} props the core input properties
 * @param {Boolean} props.clean whether to clean the local data. This compares
 * the cache to the data for insertion, if cache files exist for something that
 * is not being inserted, we assume that this should be deleted from api.ai
 * @param {Boolean} props.cleanForceSync whether to force api.ai to match
 * exactly to our local application. This deletes anything on api.ai that does
 * not exist in the application (such as items manually added into the api.ai
 * console interface)
 * @return {Promise} resolves/rejects on completion
 * TODO: If removing entities before intents, there is a chance that an intent
 * could still be using entities that are being removed. Need to address this:
 * 'Some entity names are in use: [entity_name]'
 * @private
 */
exports.updateAPIAI = props => new Promise((resolve, reject) => {
  getIntentsAndEntities(props)
    .then(({ intents, entities }) => {
      const tasks = [
        { fn: updateEntities, args: [props, intents] },
        { fn: updateIntents, args: [props, intents] },
      ];

      if (props.clean && !props.cleanForceSync) {
        // tasks.unshift({ fn: cleanEntities, args: [props, entities] });
        tasks.push({ fn: cleanIntents, args: [props, intents] });
      } else if (props.cleanForceSync) {
        debug(chalk.bold.yellow('Force syncing api.ai to local...'));

        tasks.unshift({ fn: cleanEntities, args: [props, entities] });
        tasks.push({ fn: cleanIntents, args: [props, intents] });
      }

      Promise.allSync(tasks)
        .then(() => resolve('success'))
        .catch(err => reject(err));
    })
    .catch(err => reject(err));
});
