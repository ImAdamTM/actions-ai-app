// bin/api/tasks/get

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const request = require('request');
const { getIntents, getEntities } = require('../../../bin/api/tasks/get');

chai.use(chaiAsPromised);
chai.use(sinonChai);

// Constants
const { expect } = chai;
const mockProps = {
  apiURL: 'https://api.api.ai/v1',
  apiToken: '',
};

// Tasks
describe('bin/api/tasks/get', () => {
  let requestStub;

  beforeEach(() => {
    requestStub = sinon.stub(request, 'get').callsFake((props, callback) => {
      callback(null, '', { data: [] });
    });
  });

  afterEach(() => {
    requestStub.restore();
  });

  describe('getIntents()', () => {
    it('attempts to load intents from api.ai', () =>
      expect(getIntents(mockProps)).to.eventually.be.fulfilled);

    it('rejects on api.ai error response', () => {
      requestStub.restore();

      requestStub = sinon.stub(request, 'get').callsFake((props, callback) => {
        callback('request error', '', { data: [] });
      });

      return expect(getIntents(mockProps)).to.eventually.be.rejectedWith(
        'request error');
    });

    it('rejects when api.ai response bad', () => {
      requestStub.restore();

      requestStub = sinon.stub(request, 'get').callsFake((props, callback) => {
        callback(null, '', null);
      });

      return expect(getIntents(mockProps)).to.eventually.be.rejectedWith(
        'No data');
    });

    it('rejects when api.ai status invalid', () => {
      requestStub.restore();

      requestStub = sinon.stub(request, 'get').callsFake((props, callback) => {
        callback(null, '', { status: { code: 400 } });
      });

      return expect(getIntents(mockProps)).to.eventually.be.rejectedWith({
        status: { code: 400 },
      });
    });
  });

  describe('getEntities()', () => {
    it('rejects on api.ai error response', () => {
      requestStub.restore();

      requestStub = sinon.stub(request, 'get').callsFake((props, callback) => {
        callback('request error', '', { data: [] });
      });

      return expect(getEntities(mockProps)).to.eventually.be.rejectedWith(
        'request error');
    });

    it('rejects when api.ai response bad', () => {
      requestStub.restore();

      requestStub = sinon.stub(request, 'get').callsFake((props, callback) => {
        callback(null, '', null);
      });

      return expect(getEntities(mockProps)).to.eventually.be.rejectedWith(
        'No data');
    });

    it('rejects when api.ai status invalid', () => {
      requestStub.restore();

      requestStub = sinon.stub(request, 'get').callsFake((props, callback) => {
        callback(null, '', { status: { code: 400 } });
      });

      return expect(getEntities(mockProps)).to.eventually.be.rejected;
    });
  });
});
