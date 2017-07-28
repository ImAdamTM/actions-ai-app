// Facts

const { intent, invokeIntent, action } = require('../ai');

// Constants
const FACTS = [
  'Super interesting fact 1.',
  'Super interesting fact 2.',
  'Super interesting fact 3.',
  'Super interesting fact 4.',
];

/**
 * Shuffles an existing array. Mutates the original array
 *
 * @param  {Array} a the array to shuffle
 * @return {Array} the mutated array
 */
const shuffle = (a) => {
  for (let i = a.length; i; i -= 1) {
    const j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]];
  }

  return a;
};


/**
 * Fact action group
 * @type {action}
 */
action('facts', {
  RANDOMIZE_USER_FACT_INDEXES: (state) => {
    const newState = Object.assign({}, state);
    if (newState.indexes.length) {
      // Don't need to do anything if user fact indexes are
      // already randomized
      return newState;
    }

    newState.current = 0;
    // Returns a randomized array of indexes (E.g. [3, 0, 1, 5, 4])
    newState.indexes = shuffle(FACTS.map((item, index) => index));
    return newState;
  },
  NEXT_FACT: (state) => {
    const newState = Object.assign({}, state);
    newState.current += 1;
    if (newState.current > newState.indexes.length - 1) {
      // If no more facts, start from beginning
      newState.current = 0;
    }

    return newState;
  },
  RESET_FACT: (state) => {
    const newState = Object.assign({}, state);
    newState.current = 0;
    console.log('resetting');
    return newState;
  },
}, {
  current: 0,
  indexes: [],
});

/**
 * User asks for a fact
 * @type {intent}
 */
intent('input.fact', {
  userSays: [
    'Got any facts?',
    'Tell me a fact',
    'Tell a fact',
    'I want a fact',
    'Tell me an interesting fact',
    'interesting fact',
  ],
}, (res, ssml) => {
  ssml.add('OK!');
  // Randomize the fact indexes into the user session
  res.store.dispatch('RANDOMIZE_USER_FACT_INDEXES');

  invokeIntent(res, 'input.fact.tell')
    .then((output) => {
      ssml.add(output);
      res.ask(ssml);
    });
});

/**
 * The tell fact invocation. This is an internal only intent (in that it is
 * not registered onto API.ai as the user never access independently). We use
 * it to tell the current fact
 * @type {intent}
 */
intent('input.fact.tell', null, (res, ssml) => {
  const { current, indexes } = res.store.getState().facts;
  const fact = FACTS[indexes[current]];

  ssml.add(fact);

  invokeIntent(res, 'input.fact.next')
    .then((output) => {
      ssml.add(output);
      res.ask(ssml);
    });
});

/**
 * The next fact invocation. This is an internal only intent (in that it is
 * not registered onto API.ai as the user never access independently). We use
 * it to prompt the user whether they would like to hear the next fact
 * @type {intent}
 */
intent('input.fact.next', null, (res, ssml) => {
  const { current, indexes } = res.store.getState().facts;
  ssml.pause(0.5);

  if (indexes[current + 1] !== undefined) {
    res.store.dispatch('NEXT_FACT');

    // We have another fact after the current one
    ssml.add('Would you like to hear another fact?');
    // Set the context for the response intent
    res.setContext('fact_prompt_next_context');
    res.ask(ssml);
    return;
  }

  // All out of facts
  ssml.add('That\'s all the facts I have for you.');
  ssml.add('Is there something else I can help you with?');

  // Reset the facts index
  res.store.dispatch('RESET_FACT');

  res.ask(ssml);
});

/**
 * The next response invocation. This is the respons from the
 * `fact_prompt_next_context` that is applied in the `input.fact.next`
 * internal intent
 * @type {intent}
 */
intent('input.fact.next.response', {
  contexts: ['fact_prompt_next_context'],
  userSays: [
    '@{response:yes}',
  ],
}, (res, ssml) => {
  const response = res.getArgument('response');

  ssml.add('OK!');

  if (response.match(/yes/)) {
    // Dispatch to go to the next fact
    // Then invoke the `input.fact.tell` intent again
    invokeIntent(res, 'input.fact.tell')
      .then((output) => {
        ssml.add(output);
        res.ask(ssml);
      });

    return;
  }

  // User said no
  ssml.add('Is there something else I can help you with?');

  // Reset the facts index
  res.store.dispatch('RESET_FACT');

  res.ask(ssml);
});
