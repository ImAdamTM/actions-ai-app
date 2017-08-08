// bin/lib/store

const chai = require('chai');
const { action, createStore } = require('../../bin/lib/store');

// Constants
const { expect } = chai;
const sample = {
  TEST: state => state,
  TEST_NO_STATE: () => {
    // No new state is returned
  },
  TEST_CHANGE_VALUE: (state, payload) => {
    const newState = Object.assign({}, state);
    newState.value = payload;
    return newState;
  },
};

// Tasks
describe('bin/lib/store', () => {
  let store;
  let actionModule;
  let actions;
  let reducers;
  let appData;

  process.env.ACTIONS_AI_APP_DEBUG = true;
  process.env.ACTIONS_AI_APP_NAMESPACE = 'ga-ai-app';
  process.env.ACTIONS_AI_APP_DEBUG = 'ga-ai-app:*';

  beforeEach(() => {
    actions = new Map();
    reducers = {};
    appData = { data: {} };
    actionModule = action.bind({ actions, reducers });
  });

  describe('action()', () => {
    it('adds an action', () => {
      actionModule('test', sample);
      expect(actions.has('test')).to.eq(true);
    });

    it('prevents action being added if called after app start()', () => {
      actionModule = action.bind({ actions, reducers, started: true });
      actionModule('test', sample);
      expect(actions.has('test')).to.eq(false);
    });

    it('expects error when adding an action group with duplicate key', () => {
      actionModule('test', sample);
      expect(() => actionModule('test', sample)).to.throw(
        'Action group exists with key: test');
    });
  });

  describe('Store()', () => {
    it('warns that a dispatched event did not return a new state', () => {
      actionModule('test', sample, {});
      store = createStore({ reducers }, appData, {});

      store.dispatch('TEST_NO_STATE');
      expect(reducers.TEST_NO_STATE[0].method({})).to.eq(undefined);
    });

    it('dispatches and updates a value in the store', () => {
      actionModule('test', sample, { value: 0 });

      store.dispatch('TEST_CHANGE_VALUE', 'changed');
      expect(store.getState().test.value).to.eq('changed');
    });
  });
});
