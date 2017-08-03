// bin/lib/intent

const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const { intent, invokeIntent } = require('../../bin/lib/intent');
const { createStore } = require('../../bin/lib/store');
const SSML = require('../../bin/lib/SSML');

chai.use(chaiAsPromised);
chai.use(sinonChai);

// Constants
const { expect } = chai;

// Tasks
describe('bin/lib/intent', () => {
  let intentRegistry;
  let intentModule;
  let invokeIntentModule;
  let intents;
  const intentProps = { errorMessage: 'An error occurred.' };
  let reducers;
  let appData;
  let store;

  beforeEach(() => {
    reducers = {};
    appData = { data: {} };
    intentRegistry = new Map();
    intents = {
      store: new Map(),
      raw: new Map(),
    };
    intentModule = intent.bind({
      reducers,
      intentRegistry,
      intents,
      props: intentProps,
    });
    invokeIntentModule = invokeIntent.bind({ intents });
  });

  describe('intent() call', () => {
    it('expects to fail when intent errors', () => {
      store = createStore({ reducers }, appData, {});
      const data = { store };

      intentModule('test', null, () => {
        nonexistentMethod(); // eslint-disable-line
      });

      return expect(intents.store.get('test')(data))
        .to.eventually.become('An error occurred.');
    });

    it('expects to output when intent completes with string', () => {
      store = createStore({ reducers }, appData, {});
      const data = { store, tell: () => {}, ask: () => {} };

      intentModule('test', null, (res) => {
        res.ask('something');
      });

      return expect(intents.store.get('test')(data))
        .to.eventually.become('something');
    });

    it('expects to output when intent completes with ssml', () => {
      store = createStore({ reducers }, appData, {});
      const data = { store, tell: () => {}, ask: () => {} };

      intentModule('test', null, (res, ssml) => {
        ssml.add('test');
        res.ask(ssml);
      });
      return expect(intents.store.get('test')(data))
        .to.eventually.be.an.instanceOf(SSML);
    });

    it('expects to output when intent completes with no output', () => {
      store = createStore({ reducers }, appData, {});
      const data = { store, tell: () => {}, ask: () => {} };

      intentModule('test', null, (res) => {
        res.ask();
      });

      return expect(intents.store.get('test')(data))
        .to.eventually.become(undefined);
    });

    it('expects to output with override behavior', () => {
      store = createStore({ reducers }, appData, {});
      const data = {
        store,
        APP_OVERRIDE: true,
        tellPrimary: () => {},
        askPrimary: () => {},
      };

      intentModule('test', null, (res) => {
        res.ask('override');
      });

      return expect(intents.store.get('test')(data))
        .to.eventually.become('override');
    });
  });

  describe('intent()', () => {
    it('prevents intent being added if called after app start()', () => {
      intentModule = intent.bind({
        reducers,
        intentRegistry,
        intents,
        props: intentProps,
        started: true,
      });

      intentModule('test', { userSays: ['hello'] }, () => {});
      expect(intentRegistry.has('test')).to.eq(false);
    });

    it('throws an error if no key is specified', () => {
      expect(() => intentModule())
        .to.throw('An intent key must be specified');
    });

    it('registers an intent with api.ai config', () => {
      store = createStore({ reducers }, appData, {});
      intentModule('test', { userSays: ['hello'] }, () => {});
      expect(intentRegistry.get('test').id).to.eq('test');
    });

    it('accepts action in place of config', () => {
      store = createStore({ reducers }, appData, {});
      intentModule('test', (res, ssml, next) => {
        next('hello');
      });

      return expect(invokeIntentModule({ store }, 'test'))
        .to.eventually.become('hello');
    });

    it('throws an error when adding an intent with duplicate key', () => {
      intentModule('test', null, () => {});
      expect(() => intentModule('test', null, () => {}))
        .to.throw('Intent with key already exists: test');
    });

    it('throws an error if no intent action method is specified', () => {
      expect(() => intentModule('test'))
        .to.throw('An intent action method must be specified');
    });
  });

  describe('invokeIntent()', () => {
    it('expects to fail when intent with key does not exist', () => {
      store = createStore({ reducers }, appData, {});

      return expect(invokeIntentModule({ store }, 'test'))
        .to.eventually.become(null);
    });

    it('expects to fail when intent invoked contains error', () => {
      store = createStore({ reducers }, appData, {});
      intentModule('test', null, () => nonexistentMethod()); // eslint-disable-line

      return expect(invokeIntentModule({ store }, 'test'))
        .to.eventually.become(null);
    });

    it('invokes an intent with empty response', () => {
      store = createStore({ reducers }, appData, {});
      intentModule('test', null, (res, ssml, next) => {
        next();
      });

      return expect(invokeIntentModule({ store }, 'test'))
        .to.eventually.become({ phrases: [] });
    });

    it('invokes an intent with empty response', () => {
      store = createStore({ reducers }, appData, {});
      intentModule('test', null, (res, ssml, next) => {
        next();
      });

      return expect(invokeIntentModule({ store }, 'test'))
        .to.eventually.become({ phrases: [] });
    });

    it('invokes an intent that uses ask() response', () => {
      store = createStore({ reducers }, appData, {});
      intentModule('test', null, (res) => {
        res.ask('testing');
      });

      return expect(invokeIntentModule({ store }, 'test'))
        .to.eventually.become('testing');
    });

    it('invokes an intent that uses next() response', () => {
      store = createStore({ reducers }, appData, {});
      intentModule('test', null, (res, ssml, next) => {
        next('testing');
      });

      return expect(invokeIntentModule({ store }, 'test'))
        .to.eventually.become('testing');
    });
  });
});
