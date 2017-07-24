// bin/api/tasks/compare

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const fs = require('fs-extra');
const {
  compareIntentWithCache,
  compareEntitiesWithCache,
} = require('../../../bin/api/tasks/compare');

chai.use(chaiAsPromised);
chai.use(sinonChai);

// Constants
const { expect } = chai;

// Tests
describe('bin/api/tasks/compare', () => {
  let fsEnsureStub;
  let fsReadStub;
  let fsEnsureDirSyncStub;

  beforeEach(() => {
    fsEnsureStub = sinon.stub(fs, 'ensureFile')
      .callsFake((inputPath, callback) => {
        callback('', null);
      });

    fsEnsureDirSyncStub = sinon.stub(fs, 'ensureDirSync')
      .callsFake(() => {});

    fsReadStub = sinon.stub(fs, 'readJson')
      .callsFake(() => Promise.resolve({ test: 'test' }));
  });

  afterEach(() => {
    fsEnsureStub.restore();
    fsEnsureDirSyncStub.restore();
    fsReadStub.restore();
  });

  describe('compareIntentWithCache()', () => {
    it('matches intent with cache', () =>
      expect(compareIntentWithCache({ test: 'test' }, './cache'))
        .to.eventually.eq(true));

    it('observes mismatch between intent and cache', () =>
      expect(compareIntentWithCache({ test: 'test2' }, './cache'))
        .to.eventually.eq(false));

    it('handles failure to ensure file', () => {
      fsEnsureStub.restore();
      fsEnsureStub = sinon.stub(fs, 'ensureFile')
        .callsFake((inputPath, callback) => {
          callback('', 'ensure error');
        });

      return expect(compareIntentWithCache({ test: 'test' }, './cache'))
        .to.eventually.eq(null);
    });

    it('handles failure to read cache json', () => {
      fsReadStub.restore();
      fsReadStub = sinon.stub(fs, 'readJson')
        .callsFake(() => Promise.reject());

      return expect(compareIntentWithCache({ test: 'test' }, './cache'))
        .to.eventually.eq(false);
    });
  });

  describe('compareEntitiesWithCache()', () => {
    it('matches entities with cache', () =>
      expect(compareEntitiesWithCache({ test: 'test' }, './cache'))
        .to.eventually.eq(true));

    it('observes mismatch between entities and cache', () =>
      expect(compareEntitiesWithCache({ test: 'test2' }, './cache'))
        .to.eventually.eq(false));

    it('handles failure to ensure file', () => {
      fsEnsureStub.restore();
      fsEnsureStub = sinon.stub(fs, 'ensureFile')
        .callsFake((inputPath, callback) => {
          callback('', 'ensure error');
        });

      return expect(compareEntitiesWithCache({ test: 'test' }, './cache'))
        .to.eventually.eq(null);
    });

    it('handles failure to read cache json', () => {
      fsReadStub.restore();
      fsReadStub = sinon.stub(fs, 'readJson')
        .callsFake(() => Promise.reject());

      return expect(compareEntitiesWithCache({ test: 'test' }, './cache'))
        .to.eventually.eq(false);
    });
  });
});
