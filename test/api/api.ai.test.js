// bin/api/api.ai

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const request = require('request');
const fs = require('fs-extra');
const { updateAPIAI } = require('../../bin/api/api.ai');

chai.use(chaiAsPromised);
chai.use(sinonChai);

// Constants
const { expect } = chai;
const mockProps = {
  cache: './cache',
  clean: true,
  apiURL: 'https://api.api.ai/v1',
  apiToken: '',
  intents: new Map([['test', { name: 'test' }]]),
  entities: new Map([['test', { test: 'test' }]]),
};

// Tasks
describe('bin/api/api.ai', () => {
  let requestGetStub;
  let requestPutStub;
  let requestPostStub;
  let requestDeleteStub;
  let fsEnsureStub;
  let fsEnsureDirSyncStub;
  let fsReadStub;
  let fsReaddirSyncStub;
  let fsWriteStub;
  let fsRemoveStub;

  beforeEach(() => {
    requestGetStub = sinon.stub(request, 'get').callsFake((props, callback) => {
      callback(null, '', [{ id: 'test', name: 'test' }]);
    });

    requestPutStub = sinon.stub(request, 'put').callsFake((props, callback) => {
      callback(null, '', { status: { code: 200 } });
    });

    requestPostStub = sinon
      .stub(request, 'post')
      .callsFake((props, callback) => {
        callback(null, '', { status: { code: 200 } });
      });

    requestDeleteStub = sinon
      .stub(request, 'delete')
      .callsFake((props, callback) => {
        callback(null, '', { status: { code: 200 } });
      });

    fsEnsureStub = sinon
      .stub(fs, 'ensureFile')
      .callsFake((inputPath, callback) => {
        callback('', null);
      });

    fsEnsureDirSyncStub = sinon.stub(fs, 'ensureDirSync').callsFake(() => {});

    fsReadStub = sinon
      .stub(fs, 'readJson')
      .callsFake(() => Promise.resolve({ test: 'test' }));

    fsReaddirSyncStub = sinon
      .stub(fs, 'readdirSync')
      .callsFake(() => ['a.json', 'b.json', 'c.json']);

    fsWriteStub = sinon
      .stub(fs, 'writeJson')
      .callsFake(() => Promise.resolve());

    fsRemoveStub = sinon.stub(fs, 'remove').callsFake(
      () =>
        new Promise((resolve) => {
          resolve();
        }));
  });

  afterEach(() => {
    requestGetStub.restore();
    requestPutStub.restore();
    requestPostStub.restore();
    requestDeleteStub.restore();
    fsEnsureStub.restore();
    fsEnsureDirSyncStub.restore();
    fsReadStub.restore();
    fsReaddirSyncStub.restore();
    fsWriteStub.restore();
    fsRemoveStub.restore();
  });

  describe('updateAPIAI()', () => {
    it('attempts to sync application data with api.ai', () =>
      expect(updateAPIAI(mockProps)).to.eventually.eq('success'));

    it('syncs application data to api.ai with `cleanForceSync()`', () => {
      const props = {
        cache: './cache',
        cleanForceSync: true,
        apiURL: 'https://api.api.ai/v1',
        apiToken: '',
        intents: new Map([['test', { name: 'test' }]]),
        entities: new Map([['test', { test: 'test' }]]),
      };

      return expect(updateAPIAI(props)).to.eventually.eq('success');
    });

    it('expects to fail when unable to load intents from api.ai', () => {
      requestGetStub.restore();
      requestGetStub = sinon
        .stub(request, 'get')
        .callsFake((props, callback) => {
          callback('bad request', '', [{ id: 'test', name: 'test' }]);
        });

      return expect(updateAPIAI(mockProps)).to.eventually.be.rejected;
    });

    it('expects to fail when bad tasks fail', () => {
      fsWriteStub.restore();
      fsWriteStub = sinon
        .stub(fs, 'writeJson')
        .callsFake(() => Promise.reject());

      const props = {
        cache: './cache',
        clean: true,
        apiURL: 'https://api.api.ai/v1',
        apiToken: '',
        intents: new Map([['unmatched', { name: 'unmatch' }]]),
        entities: new Map([['test', { test: 'test' }]]),
      };

      return expect(updateAPIAI(props)).to.eventually.be.rejected;
    });

    it('retries when entities sync fails then succeeds', () => {
      requestDeleteStub.restore();
      const props = {
        cache: './cache',
        cleanForceSync: true,
        apiURL: 'https://api.api.ai/v1',
        apiToken: '',
        intents: new Map([['test', { name: 'test' }]]),
        entities: new Map(),
      };

      requestDeleteStub = sinon
        .stub(request, 'delete')
        .callsFake((innerProps, callback) => {
          requestDeleteStub.restore();
          requestDeleteStub = sinon
            .stub(request, 'delete')
            .callsFake((a, callbackInner) => {
              callbackInner(null, '', { status: { code: 200 } });
            });

          callback(null, '', { status: { code: 400 } });
        });

      return expect(updateAPIAI(props)).to.eventually.eq('success_retry');
    });

    it('retries when entities sync fails then fails again', () => {
      requestDeleteStub.restore();
      const props = {
        cache: './cache',
        cleanForceSync: true,
        apiURL: 'https://api.api.ai/v1',
        apiToken: '',
        intents: new Map([['test', { name: 'test' }]]),
        entities: new Map(),
      };

      requestDeleteStub = sinon
        .stub(request, 'delete')
        .callsFake((innerProps, callback) => {
          callback(null, '', { status: { code: 400, errorDetails: 'Error' } });
        });

      return expect(updateAPIAI(props)).to.eventually.be.rejected;
    });
  });
});
