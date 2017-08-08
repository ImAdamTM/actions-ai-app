// bin/lib/util/api.ai

const chai = require('chai');
const {
  configureIntent,
  compileUserSays,
} = require('../../../bin/lib/util/api.ai');

// Constants
const { expect } = chai;

// Tasks
describe('bin/lib/util/api.ai', () => {
  describe('configureIntent()', () => {
    it('expect a blank intent to be configured', () => {
      expect(configureIntent('test', {}).id).to.eq('test');
    });

    it('expects the user to say a standard phrase', () => {
      const intent = configureIntent('test', {
        userSays: ['Hello'],
      });

      expect(intent.userSays[0].data[0].text).to.eq('Hello');
    });

    it('compile empty `userSays`', () => {
      const compile = compileUserSays.bind({
        output: {
          responses: [
            {
              resetContexts: false,
              action: 'test',
              parameters: [],
            },
          ],
        },
      });

      expect(compile(null)).to.eq(null);
    });

    it('add an entity property', () => {
      const intent = configureIntent('test', {
        userSays: ['@{response:yes}', '@{response:no}'],
      });

      expect(intent.responses[0].parameters[0].value).to.eq('$response');
    });

    it('add a system (sys) entity property', () => {
      const intent = configureIntent('test', {
        userSays: ['The date is @{sys.date}'],
      });

      expect(intent.responses[0].parameters[0].dataType).to.eq('@sys.date');
    });
  });
});
