// Random

/**
 * Get a random item from an array and return the result
 *
 * @param {Array} input the input array to pick from
 * @return {Mixed} the resulting selection
 * @private
 */
exports.random = (input, invalid = null) => {
  if (!Array.isArray(input) || !input.length) {
    return invalid;
  }

  return input[Math.floor(Math.random() * input.length)];
};

/**
 * Returns a random phrase from an array (just a simple `random` method that's
 * dedicated for phrase usage
 *
 * @param {Array} arr the array to select a random item from
 */
exports.randomPhrase = input => exports.random(input, '');
