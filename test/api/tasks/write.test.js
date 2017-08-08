// bin/api/tasks/write

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const fs = require('fs-extra');
const {
  writeIntentToCache,
  writeEntitiesToCache,
} = require('../../../bin/api/tasks/write');

chai.use(chaiAsPromised);
chai.use(sinonChai);

// Constants
const { expect } = chai;
const mockIntent = {
  name: 'test',
};
const mockEntities = [];

// Tasks
describe('bin/api/tasks/write', () => {
  let fsStub;

  beforeEach(() => {
    fsStub = sinon.stub(fs, 'writeJson').callsFake(
      () =>
        new Promise((resolve) => {
          resolve();
        }));
  });

  afterEach(() => {
    fsStub.restore();
  });

  describe('writeIntentToCache()', () => {
    it('tries to write an intent to cache', () =>
      expect(writeIntentToCache(mockIntent, './cache')).to.eventually.be
        .fulfilled);

    it('handles failure to write an intent to cache', () => {
      fsStub.restore();
      fsStub = sinon.stub(fs, 'writeJson').callsFake(
        () =>
          new Promise((resolve, reject) => {
            reject('write error');
          }));

      return expect(
        writeIntentToCache(mockIntent, './cache'))
        .to.eventually.be.rejectedWith('write error');
    });
  });

  describe('writeEntitiesToCache', () => {
    it('tries to write entities to cache', () =>
      expect(writeEntitiesToCache(mockEntities, './cache')).to.eventually.be
        .fulfilled);

    it('handles failure to write an intent to cache', () => {
      fsStub.restore();
      fsStub = sinon.stub(fs, 'writeJson').callsFake(
        () =>
          new Promise((resolve, reject) => {
            reject('write error');
          }));

      return expect(
        writeEntitiesToCache(mockEntities, './cache'))
        .to.eventually.be.rejectedWith('write error');
    });
  });
});
