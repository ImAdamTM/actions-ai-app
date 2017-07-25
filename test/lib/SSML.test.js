// bin/lib/SSML

const chai = require('chai');
const SSML = require('../../bin/lib/SSML');

// Constants
const { expect } = chai;
const sample = [
  'Simple SSML speech output.',
  'This is a sentence.',
  'To test SSML compilation behavior.',
];

// Tasks
describe('bin/lib/SSML', () => {
  let ssml;

  beforeEach(() => {
    ssml = new SSML();
  });

  describe('add(), output()', () => {
    it('add to and output a response', () => {
      const expected = `<speak>${sample.join(' ')}</speak>`;
      const ssmlAdd = new SSML();

      sample.forEach((sentence) => {
        ssmlAdd.add(sentence);
      });

      ssml.add(ssmlAdd);

      expect(ssml.output()).to.eq(expected);
    });

    it('apply inner repeatable of nested add', () => {
      const ssmlAdd = new SSML();

      ssmlAdd.add('Test', { repeat: false });
      ssml.add(ssmlAdd);

      expect(ssml.list()[0].repeat).to.eq(false);
    });

    it('apply inner random of nested add', () => {
      const ssmlAdd = new SSML();

      ssmlAdd.add(['Test']);
      ssml.add(ssmlAdd.list(), { random: false });
      expect(ssml.list()[0].random).to.eq(false);
    });

    it('apply inner fallback of nested add', () => {
      const ssmlAdd = new SSML();

      ssmlAdd.add(['Test']);
      ssml.add(ssmlAdd.list(), { fallback: false });
      expect(ssml.list()[0].fallback).to.eq(false);
    });

    it('apply repeatable to all non-specified of nested add', () => {
      const ssmlAdd = new SSML();
      ssmlAdd.add('Test');
      ssml.add(ssmlAdd, { repeat: false });

      expect(ssml.list()[0].repeat).to.eq(false);
    });

    it('apply repeatable to specified nested add', () => {
      const ssmlAdd = new SSML();
      ssmlAdd.add('Test', { repeat: false });
      ssml.add(ssmlAdd, { repeat: false });

      expect(ssml.phrases[0].repeat).to.eq(false);
    });

    it('add randomized phrase', () => {
      ssml.add(['a', 'b', 'c'], { random: 'true' });

      expect(ssml.list()[0].random).to.eq(true);
    });

    it('output randomized phrases', () => {
      const expected = '<speak>random</speak>';
      ssml.add(['random', 'random', 'random'], { random: 'true' });

      expect(ssml.output()).to.eq(expected);
    });

    it('add array output', () => {
      ssml.add(['a', 'b', 'c']);

      expect(ssml.list()[2].output).to.eq('c');
    });
  });

  describe('set()', () => {
    it('add to, set (override) then output a response', () => {
      const expected = '<speak>Override</speak>';

      sample.forEach((sentence) => {
        ssml.add(sentence);
      });

      ssml.set('Override');

      expect(ssml.output()).to.eq(expected);
    });
  });

  describe('audio()', () => {
    it('add audio to ssml output', () => {
      const expected = '<speak><audio src="some.mp3">Sound plays</audio></speak>';

      ssml.audio('some.mp3', { fallbackText: 'Sound plays' });

      expect(ssml.output()).to.eq(expected);
    });
  });

  describe('pause()', () => {
    it('add a default pause (without any props)', () => {
      ssml.pause();
      expect(ssml.list()[0].output).to.eq('<break time="1s"/>');
    });

    it('add a pause to ssml output', () => {
      const expected = '<speak><break time="1s"/></speak>';

      ssml.pause(1);
      expect(ssml.output()).to.eq(expected);
    });
  });

  describe('list()', () => {
    it('list the currently set phrases', () => {
      sample.forEach((sentence) => {
        ssml.add(sentence);
      });

      expect(ssml.list()).to.have.lengthOf(sample.length);
    });
  });

  describe('filterRepeatable()', () => {
    it('filter repeatable phrases', () => {
      sample.forEach((sentence) => {
        ssml.add(sentence, { repeat: false });
      });

      ssml.add('Repeated');

      const filtered = ssml.filterRepeatable(ssml.list());
      expect(filtered[0].output).to.eq('Repeated');
    });

    it('filter repeatable from ssml instance', () => {
      sample.forEach((sentence) => {
        ssml.add(sentence, { repeat: false });
      });

      ssml.add('Repeated');

      const filtered = ssml.filterRepeatable(ssml);
      expect(filtered[0].output).to.eq('Repeated');
    });

    it('shorten pauses when filtering repeatable', () => {
      ssml.pause('2');

      const filtered = ssml.filterRepeatable(ssml.list());

      expect(filtered[0].output).to.eq('<break time="0.5s"/>');
    });

    it('return original input if provided was not an array', () => {
      const filtered = ssml.filterRepeatable('Not an array');
      expect(filtered).to.eq('Not an array');
    });
  });
});
