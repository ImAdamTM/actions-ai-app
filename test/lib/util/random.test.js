// bin/lib/util/random

const chai = require('chai');
const { random, randomPhrase } = require('../../../bin/lib/util/random');

// Constants
const { expect } = chai;

// Tasks
describe('bin/lib/util/random', () => {
  describe('random()', () => {
    it('returns null for a non-array', () => {
      const subject = random('dog');
      expect(subject).to.be.a('null');
    });

    it('selects a random value from an array', () => {
      const subject = random(['a', 'b', 'c']);
      expect(subject).to.be.a('string');
    });
  });

  describe('randomPhrase()', () => {
    it('returns an empty string for a non-array', () => {
      const subject = randomPhrase('dog');
      expect(subject).to.be.a('string').and.eq('');
    });

    it('selects a random value from an array', () => {
      const subject = randomPhrase(['a', 'b', 'c']);
      expect(subject).to.be.a('string');
    });
  });
});
