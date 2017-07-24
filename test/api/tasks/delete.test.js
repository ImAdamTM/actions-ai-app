// bin/api/tasks/delete

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const request = require('request');
const fs = require('fs-extra');
const {
  createTasks,
  deleteIntents,
  deleteEntities,
} = require('../../../bin/api/tasks/delete');

chai.use(chaiAsPromised);
chai.use(sinonChai);

// Constants
const { expect } = chai;
const mockProps = {
  cache: './cache',
};

// Tasks
describe('bin/api/tasks/delete', () => {
  let requestStub;
  let fsStub;
  let mockLocalIntents;
  let mockApiAiIntents;
  let mockLocalEntities;
  let mockApiAiEntities;

  beforeEach(() => {
    requestStub = sinon.stub(request, 'delete').callsFake((props, callback) => {
      callback(null, '', { status: { code: 200 } });
    });
    fsStub = sinon.stub(fs, 'remove').callsFake(() => new Promise((resolve) => {
      resolve();
    }));
  });

  afterEach(() => {
    requestStub.restore();
    fsStub.restore();
  });

  describe('deleteEntities()', () => {
    it('attempts to delete a list of intents on api.ai', () => {
      mockLocalEntities = [{ name: 'test' }];
      mockApiAiEntities = [{ name: 'test' }];

      return expect(deleteEntities(mockLocalEntities, mockProps, mockApiAiEntities))
        .to.eventually.be.fulfilled;
    });

    it('skips when not matched on api.ai data', () => {
      mockLocalEntities = [{ name: 'test' }];
      mockApiAiEntities = [{ name: 'unmatch' }];

      return expect(deleteEntities(mockLocalEntities, mockProps, mockApiAiEntities))
        .to.eventually.be.fulfilled;
    });

    it('rejects when api.ai delete error', () => {
      requestStub.restore();
      requestStub = sinon.stub(request, 'delete').callsFake((props, callback) => {
        callback('request error', '', { status: { code: 400 } });
      });

      mockLocalEntities = [{ name: 'test' }];
      mockApiAiEntities = [{ name: 'test' }];

      return expect(deleteEntities(mockLocalEntities, mockProps, mockApiAiEntities))
        .to.eventually.be.rejectedWith('request error');
    });

    it('rejects when api.ai status invalid', () => {
      requestStub.restore();
      requestStub = sinon.stub(request, 'delete').callsFake((props, callback) => {
        callback(null, '', null);
      });

      mockLocalEntities = [{ name: 'test' }];
      mockApiAiEntities = [{ name: 'test' }];

      return expect(deleteEntities(mockLocalEntities, mockProps, mockApiAiEntities))
        .to.eventually.be.rejectedWith(null);
    });

    it('rejects when api.ai status code bad', () => {
      requestStub.restore();
      requestStub = sinon.stub(request, 'delete').callsFake((props, callback) => {
        callback(null, '', { status: 400 });
      });

      mockLocalEntities = [{ name: 'test' }];
      mockApiAiEntities = [{ name: 'test' }];

      return expect(deleteEntities(mockLocalEntities, mockProps, mockApiAiEntities))
        .to.eventually.be.rejectedWith({ status: 400 });
    });
  });

  describe('deleteIntents()', () => {
    it('attempts to delete a list of intents on api.ai and local', () => {
      mockLocalIntents = [{ name: 'test' }];
      mockApiAiIntents = [{ name: 'test' }];

      return expect(deleteIntents(mockLocalIntents, mockProps, mockApiAiIntents))
        .to.eventually.be.fulfilled;
    });

    it('attempts to delete a list of intents on local only', () => {
      mockLocalIntents = [{ name: 'test' }];

      deleteIntents(mockLocalIntents, mockProps, []);

      return expect(fsStub).to.have.been.calledWith('cache/intents/test.json');
    });

    it('rejects when api.ai delete error', () => {
      requestStub.restore();
      requestStub = sinon.stub(request, 'delete').callsFake((props, callback) => {
        callback('request error', '', { status: { code: 400 } });
      });

      mockLocalIntents = [{ name: 'test' }];
      mockApiAiIntents = [{ name: 'test' }];

      return expect(deleteIntents(mockLocalIntents, mockProps, mockApiAiIntents))
        .to.eventually.be.rejectedWith('request error');
    });

    it('rejects when api.ai status invalid', () => {
      requestStub.restore();
      requestStub = sinon.stub(request, 'delete').callsFake((props, callback) => {
        callback(null, '', null);
      });

      mockLocalIntents = [{ name: 'test' }];
      mockApiAiIntents = [{ name: 'test' }];

      return expect(deleteIntents(mockLocalIntents, mockProps, mockApiAiIntents))
        .to.eventually.be.rejectedWith(null);
    });

    it('rejects when api.ai status code bad', () => {
      requestStub.restore();
      requestStub = sinon.stub(request, 'delete').callsFake((props, callback) => {
        callback(null, '', { status: 400 });
      });

      mockLocalIntents = [{ name: 'test' }];
      mockApiAiIntents = [{ name: 'test' }];

      expect(deleteIntents(mockLocalIntents, mockProps, mockApiAiIntents))
        .to.eventually.be.rejectedWith({ status: 400 });
    });

    it('rejects when fails to delete local intent cache after api.ai delete', () => {
      fsStub.restore();
      fsStub = sinon.stub(fs, 'remove').callsFake(() => new Promise(
        (resolve, reject) => {
          reject('cache error');
        }));

      mockLocalIntents = [{ name: 'test' }];
      mockApiAiIntents = [{ name: 'test' }];

      return expect(deleteIntents(mockLocalIntents, mockProps, mockApiAiIntents))
        .to.eventually.be.rejectedWith('cache error');
    });

    it('rejects when fails to delete local intent cache', () => {
      fsStub.restore();
      fsStub = sinon.stub(fs, 'remove').callsFake(() => new Promise(
        (resolve, reject) => {
          reject('cache error');
        }));

      mockLocalIntents = [{ name: 'test' }];

      return expect(deleteIntents(mockLocalIntents, mockProps, []))
        .to.eventually.be.rejectedWith('cache error');
    });
  });

  describe('createTasks()', () => {
    it('generates a task array', () => {
      mockLocalIntents = [{ name: 'test' }];
      mockApiAiIntents = [{ name: 'test' }];
      const tasks = createTasks(mockLocalIntents, mockProps, mockApiAiIntents, 'deleteIntent');

      expect(tasks).to.be.an('array');
    });

    it('accepts task as string', () => {
      mockLocalIntents = ['test'];
      mockApiAiIntents = [{ name: 'test' }];
      const tasks = createTasks(mockLocalIntents, mockProps, mockApiAiIntents, 'deleteIntent');

      expect(tasks).to.be.an('array');
    });
  });
});
