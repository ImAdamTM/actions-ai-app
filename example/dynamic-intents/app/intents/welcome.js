// Welcome

const { intent } = require('../ai');

// Constants
const PHRASES = {
  WELCOME: [
    'Hello and welcome to cat facts!',
    'Welcome to cat facts!',
  ],
};

/**
 * The welcome intent. Say hello
 * @type {intent}
 */
intent('input.welcome', {
  userSays: [
    'Hi',
    'Hey',
    'Hello',
    'What\'s up',
  ],
}, (res, ssml) => {
  ssml.add(PHRASES.WELCOME, { random: true, repeat: false });
  ssml.add('Ask me a question about cats, or just ask for facts!');

  res.ask(ssml);
});
