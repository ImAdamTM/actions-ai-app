// Location

const { intent } = require('../ai');
const { getUserLocation } = require('./permissions');

/**
 * The location request intent
 * @type {intent}
 */
intent('input.locate', {
  userSays: [
    'What is my current location?',
    'What is my location?',
    'Find me',
    'Where am I?',
  ],
}, (res, ssml) => {
  getUserLocation(res, 'input.locate')
    .then((location) => {
      // If we don't get a valid location, it means `getUserLocation()`
      // hasn't yet resolved the users location. In which case it will
      // handle the output itself
      if (!location) return;
      const { latitude, longitude } = location.coordinates;
      ssml.add('I found you!');
      ssml.add(`You are at latitude: ${latitude}, and longitude: ${longitude}.`);
      ssml.add('The next time you ask me your location, I will remember.');
      res.ask(ssml);
    });
});
