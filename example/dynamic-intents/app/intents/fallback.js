// Fallback

const { intent } = require('../ai');

/**
 * Fallback handling
 * @type {intent}
 */
intent('input.unknown', {
  fallbackIntent: true,
}, (res, ssml) => {
  ssml.set('Sorry. I didn\'t catch that.');
  res.ask(ssml);
});
