// Intent

const chalk = require('chalk');
const SSML = require('./SSML');
const { configureIntent } = require('./util/api.ai');
const debug = require('./util/debug')('intent');
const { createStore } = require('./store');

/**
 * Add an intent configuration to the registry for API.AI insertion
 *
 * @param {Map} registry the app registry for intents
 * @param {String} key the unique name for the intent
 * @param {Object} config the compiled configuration for the intent
 * @private
 */
const registerIntent = (registry, key, config) => {
  registry.set(key, configureIntent(key, config));
};

/**
 * Adds an intent
 *
 * @param  {String} key the unique key for the intent
 * @param  {Object} config (optional) the API.AI config for the intent
 * @param  {Function} action the action method when the intent is invoked
 * @private
 */
exports.intent = function intent(key, config = null, actionCall = null) {
  let action;

  if (typeof key !== 'string') {
    throw new Error('An intent key must be specified');
  }

  if (this.intents.store.get(key)) {
    throw new Error(`Intent with key already exists: ${key}`);
  }

  if (config !== null && typeof config !== 'function') {
    // We have an intent config to register on to API.AI
    registerIntent(this.intentRegistry, key, config);
  }

  action = actionCall;

  if (typeof config === 'function') {
    action = config;
  }

  if (!action) {
    throw new Error('An intent action method must be specified');
  }

  const intentAction = (app, ssml) => new Promise((resolve) => {
    if (!app.APP_OVERRIDE) {
      app.tellPrimary = app.tell;
      app.askPrimary = app.ask;

      app.tell = (res) => { resolve({ call: 'tell', res }); };
      app.ask = (res) => { resolve({ call: 'ask', res }); };
      app.tellFirst = app.tell;
      app.askFirst = app.ask;
    } else {
      /* istanbul ignore next */
      app.tell = (res) => { resolve({ call: 'tell', res }); };
      app.ask = (res) => { resolve({ call: 'ask', res }); };
    }

    app.APP_OVERRIDE = true;

    action(app, ssml, resolve);
  });

  // Apply to the raw intent store
  this.intents.raw.set(key, intentAction);

  // Add to the intent store
  this.intents.store.set(key, (app) => {
    const ssml = new SSML();

    debug(chalk.yellow(`Intent Action invoked: ${chalk.bold(`[${key}]`)}`));

    // Create the session store
    app.store = createStore(this, app, app.data);
    app.store.dispatch('APP_START_RESPONSE');

    return new Promise((resolve) => {
      intentAction(app, ssml)
        .then((out) => {
          const output = Object.assign({
            call: 'ask',
            exclude: false,
            res: null,
            args: [],
          }, out);

          app.store.dispatch('APP_INTENT_INVOKED', key);

          if (!output.res) {
            app.store.dispatch('APP_OUTPUT', { key, output: ssml.list() });
            app.store.dispatch('APP_FINISH_RESPONSE');
            app[`${output.call}Primary`](ssml.output(), ...output.args);
          } else if (output.res instanceof SSML) {
            app.store.dispatch('APP_OUTPUT', {
              key, output: output.res.list(),
            });
            app.store.dispatch('APP_FINISH_RESPONSE');
            app[`${output.call}Primary`](output.res.output(), ...output.args);
          } else {
            app.store.dispatch('APP_OUTPUT', { key, output: output.res });
            app.store.dispatch('APP_FINISH_RESPONSE');
            app[`${output.call}Primary`](output.res, ...output.args);
          }

          resolve(output.res, ...output.args);
        })
        .catch((err) => {
          debug(`Error occurred in intent: ${err}`, 'red');
          app.FATAL_ERROR = true;
          app.tell(this.props.errorMessage);
          resolve(this.props.errorMessage);
        });
    });
  });

  return this;
};

/**
 * Manually invoke an intent
 *
 * @param {Object} app the app instance (required)
 * @param {String} key the intent key (required)
 * @return {Promise} returns a promise
 * @private
 */
exports.invokeIntent = function invokeIntent(app, key) {
  const ssml = new SSML();

  if (!this.intents.raw.get(key)) {
    debug(`Intent does not exist: ${chalk.bold.magenta(key)}`, 'red');
    return Promise.resolve(null);
  }

  debug(chalk.yellow(
    `Secondary Intent Action invoked: ${chalk.bold(`[${key}]`)}`));

  app.store.dispatch('APP_INTENT_INVOKED', key);

  return new Promise((resolve) => {
    this.intents.raw.get(key)(app, ssml).then((out) => {
      app.tell = app.tellFirst;
      app.ask = app.askFirst;

      if (!out) {
        resolve(ssml);
        return;
      }

      if (out.res) {
        resolve(out.res);
        return;
      }

      resolve(out);
    })
      .catch((err) => {
        debug('Intent invocation error:', err, 'red');
        resolve(null);
      });
  });
};
