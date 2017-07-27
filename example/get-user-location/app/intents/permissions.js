// Permissions

const { intent, invokeIntent, action } = require('../ai');

/**
 * Get the user location. Utilizes the `askForPermission()` method from
 * `actions-on-google`
 * @param  {Object} res the intent `res` instance
 * @param  {String} callbackIntent the key of the intent we will callback
 * @param  {String} locationRequestMessage the text that informs the user why
 * we are asking for their locaiton
 * @return {Promise} resolves on completion
 */
exports.getUserLocation = (
  res,
  callbackIntent = 'input.unknown',
  locationRequestMessage = 'To get your location') => {
  const location = res.store.getState().permissions.location;
  const permission = res.SupportedPermissions.DEVICE_PRECISE_LOCATION;

  if (!location) {
    // If we don't already have the users location (from a previous
    // permission request), we need to set the callback intent we
    // should use when we have a response from the location request,
    // then we `askForPermission()`, which is a native `actions-on-google`
    // behavior
    res.store.dispatch('SET_USER_LOCATION_CALLBACK_INTENT', callbackIntent);
    res.askForPermission(locationRequestMessage, permission);
  }

  return Promise.resolve(location);
};

/**
 * The permissions actions
 * @type {action}
 */
action('permissions', {
  SET_USER_LOCATION: (state, payload) => {
    // Once we have a location, push it to the state
    const newState = Object.assign({}, state);
    newState.location = payload;
    return newState;
  },
  SET_USER_LOCATION_CALLBACK_INTENT: (state, payload) => {
    // Store the callback intent we want to use after location requesting
    // is completed
    const newState = Object.assign({}, state);
    newState.locationCallback = payload;
    return newState;
  },
}, {
  location: null,
  locationCallback: null,
});

/**
 * The `actions_intent_PERMISSION` intent. This uses a native `event` that
 * is called immediately after the result of a location request from
 * `askForPermission()`
 * @type {intent}
 */
intent('intent.permissions.location', {
  events: [{ name: 'actions_intent_PERMISSION' }],
}, (res, ssml) => {
  if (res.isPermissionGranted()) {
    // User allowed us permission
    const CALLBACK = res.store.getState().permissions.locationCallback;
    const location = res.getDeviceLocation();

    // Set the location. This object contains a `coordinates` object property
    // which itself contains a `latitude` and `longitude` coordinate.
    // You could use this data with a geocoder package, such as
    // `node-geocoder` to get a more detailed location and store that instead.
    // For demonstration purposes, we'll just stick to latitude/longitude
    res.store.dispatch('SET_USER_LOCATION', location);

    // Invoke our callback intent
    invokeIntent(res, CALLBACK)
      .then((output) => {
        ssml.add(output);
        res.ask(ssml);
      });

    return;
  }

  // Permission was not granted
  ssml.add('Sorry, I need your location to perform that action.');
  ssml.add('Is there anything else I can help you with?');
  // Or you could use `invokeIntent()` to pass the user off to another intent

  res.ask(ssml);
});
