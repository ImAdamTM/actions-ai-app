// Welcome

const { intent } = require('../ai');

// Constants
const PHRASES = {
  WELCOME: ['Hello!', 'Welcome!', 'Hi!'],
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
  ssml.add('Ask me for an interesting fact!');

  res.ask(ssml);
});
