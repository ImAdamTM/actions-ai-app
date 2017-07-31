// Question

const { intent, invokeIntent } = require('../../ai');
const { QUESTIONS } = require('./cat-facts');

// Constants
const PHRASES = {
  HERES_ONE_FOR_YOU: [
    "Here's a fun cat fact for you.",
    'How about this cat fact!',
    'I have a good cat fact for you.',
    "Here's an interesting one.",
  ],
  PROMPT: [
    'Is there any other questions you had about cats?',
    'I have more cat facts, just ask!',
    'Do you have any other questions about cats?',
  ],
};

/**
 * Handle Question
 * @param {String} key the unique key for this question
 * @param {Object} question the data for this question
 * @type {Function}
 */
const handleQuestion = (key, question) => (res, ssml) => {
  // Output the answer
  ssml.add(question.answer);

  // Invoke the prompt intent
  invokeIntent(res, 'input.question.prompt')
    .then((output) => {
      ssml.pause(0.3);
      ssml.add(output);

      res.ask(ssml);
    });
};

/**
 * Iterate through all the questions and add the intents for each
 */
Object.keys(QUESTIONS).forEach((key) => {
  const q = QUESTIONS[key];

  // Dynamically register the intents with the question key
  intent(`input.question.ask.${key}`, {
    userSays: [q.question].concat(q.alternatives || []),
  }, handleQuestion(key, QUESTIONS[key]));
});

/**
 * User asks for a fact. We can also use our questions list to pick a random
 * answer and output it as a fact. For better randomization you should refer
 * to the `randomizing-without-repetition` example
 * @type {Array}
 */
intent('input.question.fact', {
  userSays: [
    'Tell me a fact about cats',
    'Tell me something about cats',
    'A fact',
    "I'd like to learn about cats",
    'What do you know about cats',
    'Tell me some fun cat facts',
    'Cat facts',
    'Do you know any cat facts?',
    'Another cat fact',
    'More cat facts!',
    'Tell me about cats',
  ],
}, (res, ssml) => {
  const keys = Object.keys(QUESTIONS);
  const key = keys[Math.floor(Math.random() * keys.length)];

  ssml.add(PHRASES.HERES_ONE_FOR_YOU, { random: true });
  ssml.pause(0.5);
  ssml.add(QUESTIONS[key].answer);

  invokeIntent(res, 'input.question.prompt')
    .then((output) => {
      ssml.pause(0.3);
      ssml.add(output);

      res.ask(ssml);
    });
});

/**
 * Prompt intent. This intent is not registered into api.ai, it is used
 * internally only to prompt the user to ask more cat related questions
 */
intent('input.question.prompt', null, (res, ssml) => {
  ssml.add(PHRASES.PROMPT, { random: true });
  res.ask(ssml);
});
