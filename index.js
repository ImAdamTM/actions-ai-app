/**
 * App initialization
 */

process.env.GOOGLE_ACTIONS_AI_APP_NAMESPACE = 'ga-ai-app';

exports.App = require('./bin/App');
exports.SSML = require('./bin/lib/SSML');
