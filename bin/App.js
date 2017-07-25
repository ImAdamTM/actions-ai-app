// App

const path = require('path');
const chalk = require('chalk');
const App = require('./lib/App');
const debugModule = require('./lib/util/debug');
const { intent, invokeIntent } = require('./lib/intent');
const { entity } = require('./lib/entity');
const { action } = require('./lib/store');
const { updateAPIAI } = require('./api/api.ai');

const debug = debugModule('app');
const debugApi = debugModule('api');
const debugInput = debugModule('input');

// Constants
const DEFAULTS = {
  APP: {
    // The URL to the api.ai API, used when managing data on api.ai
    APIAIURL: 'https://api.api.ai/v1',
    // The token to use when submitting to api.ai, refer to api.ai docs for more
    // information
    APIAIToken: null,
    // The cache location that intents/entity data should be cached to. This
    // is used to reduce the number of api.ai API calls by comparing the local
    // cache with changes and only submitting API calls when changes have
    // occurred
    cachePath: null,
    // The debug mode. Accepts either `Boolean` or a specific namespace
    debug: false, // true|false|api|api:clean|input|intent
    // Error message to output when an intent fails
    errorMessage: 'An error occurred.',
  },
  START: {
    // Whether the app should update to api.ai
    update: false,
    // Whether it should compare injection data to cached data and if there
    // is cache data that is not in injection data it should attempt to remove
    // from api.ai
    clean: false,
    // Whether it should force api.ai to match the app data (no extra data
    // on api.ai manually that is not included in the app).
    // NOTE: this should only be used if you want to manage all aspects of the
    // application internally and disallow any extra data being added to api.ai
    // manually
    cleanForceSync: false,
  },
};

/**
 * The primary application
 */
class GoogleActionsAIApp {
  /**
   * `GoogleActionsAIApp` constructor
   *
   * @param {Object} props the properties to bind to the application
   */
  constructor(props) {
    this.props = Object.assign({}, DEFAULTS.APP, props);

    this.ready = false;
    this.intentRegistry = new Map();
    this.entityRegistry = new Map();
    this.intents = {
      store: new Map(),
      raw: new Map(),
    };
    this.actions = new Map();
    this.reducers = {};

    /**
     * Registers an intent to the application
     *
     * @type {Function}
     * @param  {String} key the unique key for the intent
     * @param  {Object} config (optional) the API.AI config for the intent
     * @param  {Function} action the action method when the intent is invoked
     * @example
     * const GoogleActionsAIApp = require('actions-ai-app').App;
     * const app = new GoogleActionsAIApp({
     *   APIAIToken: 'TOKEN',
     *   cachePath: 'path/to/cache',
     *   debug: true,
     * });
     * const intent = app.intent;
     *
     * intent('input.welcome', {
     *   userSays: ['hello']
     * }, (res, ssml) => {
     *   ssml.add('When user says hello, I will say this.');
     *   res.ask(ssml);
     * });
     *
     * Outputs: `<speak>When user says hello, I will say this.</speak>`
     */
    this.intent = intent.bind(this);

    /**
     * Manually invoke an intent from inside another intent. This allows
     * you to combine behaviours and outputs based on user input
     *
     * @type {Function}
     * @param {Object} app the app instance (required)
     * @param {String} key the intent key (required)
     * @return {Promise} returns a promise
     * @example
     * const GoogleActionsAIApp = require('actions-ai-app').App;
     * const app = new GoogleActionsAIApp({
     *   APIAIToken: 'TOKEN',
     *   cachePath: 'path/to/cache',
     *   debug: true,
     * });
     * const intent = app.intent;
     *
     * intent('input.welcome.invoke', {
     *   userSays: ['hello']
     * }, (res, ssml) => {
     *   ssml.add('I also have this to say.');
     *   res.ask(ssml);
     * });
     *
     * intent('input.welcome', {
     *   userSays: ['hello']
     * }, (res, ssml) => {
     *   ssml.add('When user says hello, I will say this.');
     *
     *   invokeIntent(res, 'input.welcome.invoke')
     *     .then((output) => {
     *       ssml.add(output);
     *       res.ask(ssml);
     *     });
     * });
     *
     * Outputs: `<speak>When user says hello, I will say this. I also have this to say.</speak>`
     */
    this.invokeIntent = invokeIntent.bind(this);

    /**
     * Adds an entity to the registry for API.AI
     *
     * @type {Function}
     * @param  {type} key the unique key for the entity
     * @param  {type} terms the terms for the entity (refer to API.AI spec)
     */
    this.entity = entity.bind(this);

    /**
     * Adds an action set. Actions are used to mutate the `data` object
     * for google actions. Abstracting away from `data` into a redux style form
     * ensures that all mutations to the session data are accountable across
     * the application
     *
     * @type {Function}
     * @param  {String} key the unique key for this action group
     * @param  {type} reducers the list of reducers by key/method
     * @param  {type} defaults the default key/values for this group
     */
    this.action = action.bind(this);

    this.handleRequest = this.handleRequest.bind(this);

    if (this.props.debug) {
      const namespace = typeof this.props.debug === 'boolean' ?
        '*' :
        this.props.debug;
      process.env.ACTIONS_AI_APP_DEBUG = `${
        process.env.ACTIONS_AI_APP_NAMESPACE}:${namespace}`;
    }
  }

  /**
   * Starts the application
   *
   * @param {Object} props the options used to start the app
   * @param {String} props.update (optional) whether to update on api.ai
   * @param {Boolean} props.clean (optional) whether to clean up intents/entities
   * @param {Boolean} props.cleanForceSync (optional) whether to force api.ai to be in sync
   * @return {Promise} resolves on startup success
   */
  start(props) {
    const options = Object.assign({}, DEFAULTS.START, props);

    return new Promise((resolve) => {
      if (options.update) {
        if (!this.props.cachePath) {
          debug(chalk.bold('You must specify a `cachePath` to update API.AI'),
            'red');
          this.ready = true;
          resolve('NO_CACHE_PATH_SPECIFIED');
          return;
        }

        if (!this.props.APIAIToken) {
          debug(chalk.bold.magenta(
            'You must specify a `APIAIToken` to update API.AI'), 'red');
          this.ready = true;
          resolve('NO_TOKEN_SPECIFIED');
          return;
        }

        debugApi('Updating api.ai...');

        updateAPIAI({
          clean: options.clean,
          cleanForceSync: options.cleanForceSync,
          apiURL: this.props.APIAIURL,
          apiToken: this.props.APIAIToken,
          cache: path.join(this.props.cachePath, 'api_ai'),
          intents: this.intentRegistry,
          entities: this.entityRegistry,
        })
          .then(() => {
            debugApi('api.ai updated successfully');
            this.ready = true;
            resolve('UPDATE_SUCCESS');
          })
          .catch((err) => {
            debugApi(chalk.bold.magenta('Error updating api.ai:'), err, 'red');
            this.ready = true;
            resolve('UPDATE_FAIL');
          });

        return;
      }

      this.ready = true;
      resolve('SUCCESS');
    });
  }

  /**
   * Handles a request from API.AI
   *
   * @param  {Object} request  the request object
   * @param  {Object} response the response object
   */
  handleRequest(request, response) {
    const app = new App({ request, response });

    debugInput(
      chalk.bold(`${app.sessionId}:`),
      chalk.bold.cyan(`"${app.userInput}"`));

    // Handle the request
    app.handleRequest(this.intents.store);
    return 'REQUEST_HANDLED';
  }
}

module.exports = GoogleActionsAIApp;
