// bin/api/tasks/clean

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const request = require('request');
const fs = require('fs-extra');
const {
  getCleanList,
  cleanIntents,
  cleanEntities,
  getCachedFileList,
} = require('../../../bin/api/tasks/clean');

chai.use(chaiAsPromised);
chai.use(sinonChai);

// Constants
const { expect } = chai;
const mockIntents = new Map([['test', 'test']]);
const mockEntities = new Map([['test', { name: 'test' }]]);
const mockProps = {
  cache: './cache',
  intents: mockIntents,
  entities: mockEntities,
};

// Tests
describe('bin/api/tasks/clean', () => {
  let requestStub;
  let fsStub;
  let fsEnsureStub;
  let fsEnsureDirSyncStub;
  let fsReadStub;
  let fsReadJsonStub;
  let mockApiAiIntents;

  beforeEach(() => {
    requestStub = sinon.stub(request, 'delete')
      .callsFake((props, callback) => {
        callback(null, '', { status: { code: 200 } });
      });

    fsStub = sinon.stub(fs, 'remove')
      .callsFake(() => new Promise((resolve) => {
        resolve();
      }));

    fsEnsureStub = sinon.stub(fs, 'ensureFile')
      .callsFake((inputPath, callback) => {
        callback('', null);
      });

    fsEnsureDirSyncStub = sinon.stub(fs, 'ensureDirSync')
      .callsFake(() => {});

    fsReadStub = sinon.stub(fs, 'readdirSync')
      .callsFake(() => ['a.json', 'b.json', 'c.json']);

    fsReadJsonStub = sinon.stub(fs, 'readJson')
      .callsFake(() => Promise.resolve());
  });

  afterEach(() => {
    requestStub.restore();
    fsStub.restore();
    fsEnsureStub.restore();
    fsEnsureDirSyncStub.restore();
    fsReadStub.restore();
    fsReadJsonStub.restore();
  });

  describe('cleanIntents()', () => {
    it('attempts to clean a set of intents', () => {
      mockApiAiIntents = [{ name: 'test' }, { name: 'test' }];

      return expect(cleanIntents(mockProps, mockApiAiIntents))
        .to.eventually.be.fulfilled;
    });

    it('attempts to clean a single intent', () => {
      fsReadStub.restore();
      fsReadStub = sinon.stub(fs, 'readdirSync')
        .callsFake(() => ['a.json']);
      mockApiAiIntents = [{ name: 'test' }];

      return expect(cleanIntents(mockProps, mockApiAiIntents))
        .to.eventually.be.fulfilled;
    });
  });

  describe('cleanEntities()', () => {
    it('attempts to clean a set of entities', () => {
      mockApiAiIntents = [{ name: 'test' }, { name: 'test' }];

      return expect(cleanEntities(mockProps, mockApiAiIntents))
        .to.eventually.be.fulfilled;
    });

    it('rejects when delete entities fails', () => {
      requestStub.restore();
      requestStub = sinon.stub(request, 'delete')
        .callsFake((props, callback) => {
          callback('delete error', '', { status: { code: 200 } });
        });

      fsReadJsonStub.restore();
      fsReadJsonStub = sinon.stub(fs, 'readJson')
        .callsFake(() => Promise.resolve([{ name: 'test' }]));

      const props = {
        cache: './cache',
        cleanForceSync: true,
        intents: mockIntents,
        entities: mockEntities,
      };

      mockApiAiIntents = [{ id: 'unmatch', name: 'unmatch' }];

      return expect(cleanEntities(props, mockApiAiIntents))
        .to.eventually.be.rejectedWith('delete error');
    });

    it('rejects when `getCachedFileList()` fails', () => {
      fsEnsureStub.restore();
      fsEnsureStub = sinon.stub(fs, 'ensureFile')
        .callsFake((inputPath, callback) => {
          callback('', 'cached list error');
        });

      mockApiAiIntents = [{ name: 'test' }, { name: 'test' }];

      return expect(cleanEntities(mockProps, mockApiAiIntents))
        .to.eventually.be.rejectedWith('cached list error');
    });

    it('attempts to clean a single entity', () => {
      fsReadStub.restore();
      fsReadStub = sinon.stub(fs, 'readdirSync')
        .callsFake(() => ['a.json']);
      mockApiAiIntents = [{ name: 'test' }];

      return expect(cleanEntities(mockProps, mockApiAiIntents))
        .to.eventually.be.fulfilled;
    });
  });

  describe('getCleanList()', () => {
    it('flags intents on api.ai for removal when unmatched on local', () => {
      fsReadStub.restore();

      fsReadStub = sinon.stub(fs, 'readdirSync')
        .callsFake(() => ['test.json']);

      const props = {
        cache: './cache',
        cleanForceSync: true,
        intents: mockIntents,
      };

      mockApiAiIntents = [
        { id: 'test', name: 'test' },
        { id: 'unknown', name: 'unknown' },
      ];

      expect(getCleanList(
        props, 'intents', mockApiAiIntents, ['test'])[0].id).to.eq('unknown');
    });
  });

  describe('getCachedFileList()', () => {
    it('rejects on `ensureFile` failure', () => {
      fsEnsureStub.restore();
      fsEnsureStub = sinon.stub(fs, 'ensureFile')
        .callsFake((inputPath, callback) => {
          callback('', 'ensure error');
        });

      return expect(getCachedFileList('/path/to/file', './cache'))
        .to.eventually.be.rejectedWith('ensure error');
    });

    it('continues on `readJson` failure', () => {
      fsReadJsonStub.restore();
      fsReadJsonStub = sinon.stub(fs, 'readJson')
        .callsFake(() => Promise.reject('read error'));

      return expect(getCachedFileList('/path/to/file', './cache'))
        .to.eventually.be.fulfilled;
    });
  });
});
