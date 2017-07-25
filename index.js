/**
 * App initialization
 */

process.env.ACTIONS_AI_APP_NAMESPACE = 'actions-ai-app';

exports.App = require('./bin/App');
exports.SSML = require('./bin/lib/SSML');
