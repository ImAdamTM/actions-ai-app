// Entities

const { entity } = require('./ai');

/**
 * Add the `response` entity which matches simple yes/no commands
 * @type {action}
 */
entity('response', [
  {
    value: 'yes',
    synonyms: [
      'yes', 'yep', 'ok', 'sure', 'next', 'yup', 'got it', 'sure do',
      'yip', 'uh huh', 'yeah', 'check', 'affirmative', 'okay', 'go on',
    ],
  },
  {
    value: 'no',
    synonyms: [
      'no', 'nope', 'nah', 'not really', 'nothing', 'I don\'t',
      'I do not', 'no thanks',
    ],
  },
]);
