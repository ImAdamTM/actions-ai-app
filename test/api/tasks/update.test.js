// bin/api/tasks/update

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const request = require('request');
const fs = require('fs-extra');
const {
  updateIntent,
  updateIntents,
  updateEntities,
} = require('../../../bin/api/tasks/update');

chai.use(chaiAsPromised);
chai.use(sinonChai);

// Constants
const { expect } = chai;
const mockIntentsProps = {
  cache: './cache',
  apiURL: 'https://api.api.ai/v1',
  apiToken: '',
  intents: new Map([['test', { name: 'test' }]]),
};
const mockApiAiIntents = [{ id: 'test', name: 'test' }];
const mockEntitiesProps = {
  cache: './cache',
  apiURL: 'https://api.api.ai/v1',
  apiToken: '',
  entities: new Map([['test', { test: 'test' }]]),
};

// Tasks
describe('bin/api/tasks/update', () => {
  let requestPutStub;
  let requestPostStub;
  let fsEnsureStub;
  let fsEnsureDirSyncStub;
  let fsReadStub;
  let fsWriteStub;

  beforeEach(() => {
    requestPutStub = sinon.stub(request, 'put')
      .callsFake((props, callback) => {
        callback(null, '', { status: { code: 200 } });
      });

    requestPostStub = sinon.stub(request, 'post')
      .callsFake((props, callback) => {
        callback(null, '', { status: { code: 200 } });
      });

    fsEnsureStub = sinon.stub(fs, 'ensureFile')
      .callsFake((inputPath, callback) => {
        callback('', null);
      });

    fsEnsureDirSyncStub = sinon.stub(fs, 'ensureDirSync')
      .callsFake(() => {});

    fsReadStub = sinon.stub(fs, 'readJson')
      .callsFake(() => Promise.resolve({ test: 'test' }));

    fsWriteStub = sinon.stub(fs, 'writeJson')
      .callsFake(() => Promise.resolve());
  });

  afterEach(() => {
    requestPutStub.restore();
    requestPostStub.restore();
    fsEnsureStub.restore();
    fsEnsureDirSyncStub.restore();
    fsReadStub.restore();
    fsWriteStub.restore();
  });

  describe('updateIntents()', () => {
    it('attempts to update the intents', () =>
      expect(updateIntents(mockIntentsProps, mockApiAiIntents))
        .to.eventually.eq('success'));

    it('attempts to update the intents with unmatched', () => {
      const props = {
        cache: './cache',
        apiURL: 'https://api.api.ai/v1',
        apiToken: '',
        intents: new Map([['unmatched', { name: 'unmatched' }]]),
      };

      return expect(updateIntents(props, mockApiAiIntents))
        .to.eventually.eq('success');
    });

    it('handles rejection on failure to write cache', () => {
      fsWriteStub.restore();
      fsWriteStub = sinon.stub(fs, 'writeJson')
        .callsFake(() => Promise.reject('cache write error'));

      return expect(updateIntents(mockIntentsProps, mockApiAiIntents))
        .to.eventually.be.rejectedWith('cache write error');
    });

    it('handles rejection on invalid update response from from api.ai', () => {
      requestPutStub.restore();
      requestPostStub.restore();

      requestPutStub = sinon.stub(request, 'put')
        .callsFake((props, callback) => {
          callback('request error', '', { status: { code: 400 } });
        });

      requestPostStub = sinon.stub(request, 'post')
        .callsFake((props, callback) => {
          callback('request error', '', { status: { code: 400 } });
        });

      return expect(updateIntents(mockIntentsProps, mockApiAiIntents))
        .to.be.rejected;
    });

    it('handles rejection on bad update status from api.ai', () => {
      requestPutStub.restore();
      requestPostStub.restore();

      requestPutStub = sinon.stub(request, 'put')
        .callsFake((props, callback) => {
          callback(null, '', { status: { code: 400 } });
        });

      requestPostStub = sinon.stub(request, 'post')
        .callsFake((props, callback) => {
          callback(null, '', { status: { code: 400 } });
        });

      return expect(updateIntents(mockIntentsProps, mockApiAiIntents))
        .to.be.rejected;
    });
  });

  describe('updateIntent()', () => {
    it('skips update if local and cache match', () => {
      fsReadStub.restore();
      fsReadStub = sinon.stub(fs, 'readJson')
        .callsFake(() => Promise.resolve({ name: 'test' }));

      return expect(updateIntent({ name: 'test' }, 'test', mockIntentsProps))
        .to.eventually.eq('skipped');
    });

    it('switches to POST method if intent not found on api.ai', () => {
      updateIntent({ name: 'unmatched' }, null, mockIntentsProps)
        .then(() => expect(requestPostStub).to.have.been.called);
    });
  });

  describe('updateEntities()', () => {
    it('attempts to update the entities', () => {
      expect(updateEntities(mockEntitiesProps))
        .to.eventually.eq('success');
    });

    it('expects to resolve immediately when no entities to update', () => {
      const props = {
        cache: './cache',
        apiURL: 'https://api.api.ai/v1',
        apiToken: '',
        entities: new Map([]),
      };

      return expect(updateEntities(props))
        .to.eventually.eq('no update required');
    });

    it('handles rejection on failure to write cache when skipping', () => {
      fsWriteStub.restore();
      fsWriteStub = sinon.stub(fs, 'writeJson')
        .callsFake(() => Promise.reject('cache write error poo'));

      const props = {
        cache: './cache',
        apiURL: 'https://api.api.ai/v1',
        apiToken: '',
        entities: new Map(),
      };

      return expect(updateEntities(props))
        .to.eventually.be.rejectedWith('cache write error');
    });


    it('handles rejection on failure to write cache', () => {
      fsWriteStub.restore();
      fsWriteStub = sinon.stub(fs, 'writeJson')
        .callsFake(() => Promise.reject('cache write error poo'));

      const props = {
        cache: './cache',
        apiURL: 'https://api.api.ai/v1',
        apiToken: '',
        entities: new Map([['test', { test: 'unmatched' }]]),
      };

      return expect(updateEntities(props))
        .to.eventually.be.rejectedWith('cache write error');
    });

    it('skips update if local and cache match', () => {
      fsReadStub.restore();
      fsReadStub = sinon.stub(fs, 'readJson')
        .callsFake(() => Promise.resolve([{ test: 'test' }]));

      return expect(updateEntities(mockEntitiesProps))
        .to.eventually.eq('skipped');
    });

    it('handles rejection on invalid update response from from api.ai', () => {
      requestPutStub.restore();
      requestPostStub.restore();

      requestPutStub = sinon.stub(request, 'put')
        .callsFake((props, callback) => {
          callback('request error', '', { status: { code: 400 } });
        });

      requestPostStub = sinon.stub(request, 'post')
        .callsFake((props, callback) => {
          callback('request error', '', { status: { code: 400 } });
        });

      return expect(updateEntities(mockEntitiesProps))
        .to.be.rejected;
    });

    it('handles rejection on bad update status from api.ai', () => {
      requestPutStub.restore();
      requestPostStub.restore();

      requestPutStub = sinon.stub(request, 'put')
        .callsFake((props, callback) => {
          callback(null, '', { status: { code: 400 } });
        });

      requestPostStub = sinon.stub(request, 'post')
        .callsFake((props, callback) => {
          callback(null, '', { status: { code: 400 } });
        });

      return expect(updateEntities(mockEntitiesProps))
        .to.be.rejected;
    });
  });
});
