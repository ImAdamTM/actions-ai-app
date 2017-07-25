// Fallback

const { intent, action } = require('../ai');

// Constants
const MAX_REPROMPT = 2;

/**
 * First we create the fallback actions.
 * @type {action}
 */
action('fallback', {
  /**
   * `APP_START_RESPONSE` is a core action, and is always dispatched.
   * Here we use it to reset the `invoked` value, which we use to tell
   * whether the fallback has been invoked.
   */
  APP_START_RESPONSE: (state) => {
    const newState = Object.assign({}, state);
    newState.invoked = false;
    return newState;
  },
  /**
   * `APP_OUTPUT` is a core action, and is always dispatched.
   * It is called after the intent has completed. Here, we use it to store
   * the last output (checking that the last intent called was not eith
   * of our fallback intents -- because we only want to know the output for
   * the last valid intent)
   */
  APP_OUTPUT: (state, { key, output }) => {
    const newState = Object.assign({}, state);

    // Store the last output so long as its not from our fallback intents
    if (key !== 'input.unknown'
      && key !== 'input.unknown.response') newState.lastOutput = output;

    newState.count = newState.invoked ? newState.count + 1 : 0;
    return newState;
  },
  /**
   * When the fallback is invoked, we update the `invoked` value state so that
   * we know to increment the `count` (in `APP_OUTPUT`)
   * @param {[type]} state [description]
   */
  FALLBACK_INVOKED: (state) => {
    const newState = Object.assign({}, state);
    newState.invoked = true;
    return newState;
  },
  /**
   * Store the last known contexts so that we can restore them if the user
   * wants to go back to what they were doing
   */
  SET_FALLBACK_CONTEXTS: (state, payload) => {
    const newState = Object.assign({}, state);
    newState.contexts = payload;
    return newState;
  },
}, {
  invoked: false,
  count: 0,
  contexts: [],
  lastOutput: '',
});

/**
 * Fallback handling
 * @type {intent}
 */
intent('input.unknown', {
  fallbackIntent: true,
}, (res, ssml) => {
  const count = res.store.getState().fallback.count;

  res.store.dispatch('FALLBACK_INVOKED');

  ssml.set(`Sorry. I didn't catch that (${count + 1}).`);

  if (count >= MAX_REPROMPT) {
    // User has landed on the fallback repeatedly more times than our
    // MAX_REPROMPT allows. Redirect them
    ssml.set('I\'m having trouble understanding.');
    ssml.add('Would you like to continue?');

    // Set the context that should be sent along with the response
    // (it won't apply yet)
    res.setContext('fallback_response_context');

    // Get the contexts array
    const contexts = res.getContexts();

    if (!res.getContext('fallback_response_context')) {
      // Store the incoming contexts so that we can restore them later
      res.store.dispatch('SET_FALLBACK_CONTEXTS', contexts);
    }

    res.ask(ssml);
    return;
  }

  // Restore the current contexts
  res.restoreContexts();

  const lastOutput = res.store.getState().fallback.lastOutput;

  if (lastOutput) {
    // Filter the last output to exclude items that we don't want to repeat
    const last = ssml.filterRepeatable(lastOutput);

    ssml.add(last);

    if (!last.length) ssml.add(lastOutput);
  }

  res.ask(ssml);
});

/**
 * Response to fallback prompt (when the app fails to understand the user
 * after multiple subsequent fallback invocations, determined by `MAX_REPROMPT`)
 * @type {intent}
 */
intent('input.unknown.response', {
  contexts: ['fallback_response_context'],
  userSays: [
    '@{response:yes}',
  ],
}, (res, ssml) => {
  const response = res.getArgument('response');

  if (response.match(/^(yes)$/)) {
    // User said yes to continuing
    const { contexts, lastOutput } = res.store.getState().fallback;

    // Restore from the contexts we cached so the user can continue
    res.restoreContexts(contexts);

    ssml.set('OK!');

    if (lastOutput) {
      ssml.add(lastOutput);
    }

    res.ask(ssml);
    return;
  }

  // User said no to continuing
  ssml.set('OK. Bye!', { random: true });

  res.tell(ssml);
});
