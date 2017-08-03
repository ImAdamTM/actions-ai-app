// Store

const chalk = require('chalk');
const debug = require('./util/debug')('store');

const defaultState = {};

/**
 * The data `Store` is used to manage the session data for the application.
 * We do not want to manipulate `app.data` directly as it becomes
 * un-managable as things expand. Instead, we use a `redux` style approach
 * where the data is managed via state.
 *
 * To learn more, read the [redux docs](http://redux.js.org/docs/basics/)
 *
 * @param {App} context the current instance context
 * @param {Object} app the app response data
 * @param {Object} data the data to assign to the state on creation
 * @return {Object} the exposed methods for manipulating the store/state
 * @private
 */
const Store = function Store(context, app, data) {
  const state = Object.assign({}, defaultState, data);

  return {
    dispatch(key, payload) {
      const reducers = context.reducers[key];
      /* istanbul ignore next */
      if (!reducers) return;

      for (let i = 0, len = reducers.length; i < len; i += 1) {
        const reducer = reducers[i];
        const newState = reducer.method(state[reducer.namespace], payload);

        if (newState === undefined) {
          debug(
            chalk.bold('Reducer did not return a new state:'),
            chalk.bold.magenta(`${reducer.namespace}.${key}`));
        } else {
          state[reducer.namespace] = newState;
        }
      }

      app.data = Object.assign({}, app.data, state);
    },
    getState() {
      return state;
    },
  };
};

/**
 * Adds an action set. Actions are used to mutate the `data` object
 * for google actions. Abstracting away from `data` into a redux style form
 * ensures that all mutations to the session data are accountable across
 * the application
 *
 * @param  {String} key the unique key for this action group
 * @param  {type} reducers the list of reducers by key/method
 * @param  {type} defaults the default key/values for this group
 * @private
 */
exports.action = function action(key, reducers, defaults = {}) {
  if (this.started) {
    debug(chalk.bold(`Actions may only be added before start() is called! ('${key}')`), 'red');
    return this;
  }

  if (this.actions.get(key)) {
    throw new Error(`Action group exists with key: ${key}`);
  }

  defaultState[key] = defaults;

  this.actions.set(key, defaults);

  Object.keys(reducers).forEach((reducerKey) => {
    // Create key if does not exist
    /* istanbul ignore next */
    if (!this.reducers[reducerKey]) this.reducers[reducerKey] = [];

    this.reducers[reducerKey].push({
      namespace: key,
      method: reducers[reducerKey],
    });
  });

  return this;
};

/**
 * Creates the data store. This is created for every `POST` request
 *
 * @param {App} context the current instance context
 * @param {Object} app the app response data
 * @param {Object} data the data to assign to the state on creation
 * @return {Store} returns a new instance of `Store`
 * @private
 */
exports.createStore = (context, app, data) => new Store(context, app, data);
