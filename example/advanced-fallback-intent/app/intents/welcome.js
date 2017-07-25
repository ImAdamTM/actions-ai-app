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
  ssml.add('Lets test the fallback intent!');
  ssml.add('I won\'t repeat this.', { repeat: false });
  ssml.add('I will only say this on fallback.', { fallback: true });
  ssml.add('Test this fallback by saying anything. For example, say "Fallback".',
    { repeat: false });
  ssml.add('Say something else again.', { fallback: true });

  res.ask(ssml);
});
