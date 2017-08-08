// Api.ai

const chalk = require('chalk');
const Promise = require('../lib/util/promise-extra');
const { updateIntents } = require('./tasks/update');
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
 * @private
 */
exports.updateAPIAI = props =>
  new Promise((resolve, reject) => {
    getIntentsAndEntities(props)
      .then(({ intents, entities }) => {
        const tasks = [{ fn: updateIntents, args: [props, intents] }];

        if (props.clean && !props.cleanForceSync) {
          tasks.unshift({ fn: cleanEntities, args: [props, entities, true] });
          tasks.push({ fn: cleanIntents, args: [props, intents] });
        } else if (props.cleanForceSync) {
          debug(chalk.bold.yellow('Force syncing api.ai from local...'));

          tasks.unshift({ fn: cleanEntities, args: [props, entities, true] });
          tasks.push({ fn: cleanIntents, args: [props, intents] });
        }

        Promise.allSync(tasks)
          .then((res) => {
            if (res[0] === 'retry_entities') {
              debug('Retry cleaning entities...');
              cleanEntities(props, entities, false)
                .then(() => resolve('success_retry'))
                .catch(err => reject(err));

              return;
            }

            resolve('success');
          })
          .catch(err => reject(err));
      })
      .catch(err => reject(err));
  });
