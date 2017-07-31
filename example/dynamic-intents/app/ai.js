// AI App Creator

const ActionsAiApp = require('actions-ai-app').App;

/**
 * Create a new app instance and then export it and the key methods.
 * We do this so that we can import this file from anywhere within our
 * application and access the methods (intent, entity, action, invokeIntent)
 * @type {ActionsAiApp}
 */
const app = new ActionsAiApp({
  APIAIToken: 'API_AI_DEVELOPER_TOKEN',
  cachePath: 'cache',
  debug: true,
});

exports.app = app;

/**
 * Export the `intent` method
 * @type {Function}
 */
exports.intent = app.intent;

/**
 * Export the `invokeIntent` method
 * @type {Function}
 */
exports.invokeIntent = app.invokeIntent;

/**
 * Export the `entity` method
 * @type {Function}
 */
exports.entity = app.entity;

/**
 * Export the `action` method
 * @type {Function}
 */
exports.action = app.action;
