// bin/App

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const request = require('request');
const fs = require('fs-extra');
const App = require('../bin/App');
const {
  MockRequest,
  MockResponse,
  createLiveSessionApiAppBody,
} = require('./test.util/actions-on-google');

chai.use(chaiAsPromised);
chai.use(sinonChai);

// Constants
const { expect } = chai;

// Tasks
describe('bin/App', () => {
  let requestGetStub;
  let requestPutStub;
  let requestPostStub;
  let fsEnsureStub;
  let fsReadStub;
  let fsReaddirSyncStub;
  let fsWriteStub;
  let fsRemoveStub;
  let mockRequest;
  let mockResponse;
  const headers = {
    'Content-Type': 'application/json',
    'google-assistant-api-version': 'v2',
  };

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

    fsEnsureStub = sinon
      .stub(fs, 'ensureFile')
      .callsFake((inputPath, callback) => {
        callback('', null);
      });

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
    fsEnsureStub.restore();
    fsReadStub.restore();
    fsReaddirSyncStub.restore();
    fsWriteStub.restore();
    fsRemoveStub.restore();
  });

  describe('initialization', () => {
    it('create a new App()', () => {
      const app = new App();

      expect(app).to.be.an.instanceOf(App);
    });

    it('create a new App() with general debugging', () => {
      const app = new App({ debug: true });

      expect(app.props.debug).to.eq(true);
    });

    it('create a new App() with targeted debugging', () => {
      const app = new App({ debug: 'intent' });

      expect(app.props.debug).to.eq('intent');
    });
  });

  describe('start()', () => {
    it('starts without api.ai update', () => {
      const app = new App();

      return expect(app.start()).to.eventually.eq('SUCCESS');
    });

    it('expects api.ai update to succeed', () => {
      const app = new App({
        APIAIToken: '123',
        cachePath: './cache',
      });

      const props = {
        update: true,
      };

      return expect(app.start(props)).to.eventually.eq('UPDATE_SUCCESS');
    });

    it('expects api.ai update to fail when no cache path specified', () => {
      const app = new App();
      const props = {
        update: true,
      };

      return expect(app.start(props)).to.eventually.eq(
        'NO_CACHE_PATH_SPECIFIED');
    });

    it('expects api.ai update to fail when no api.ai token specified', () => {
      const app = new App({
        cachePath: './cache',
      });

      const props = {
        update: true,
      };

      return expect(app.start(props)).to.eventually.eq('NO_TOKEN_SPECIFIED');
    });

    it('expects api.ai update to fail on update rejection', () => {
      requestGetStub.restore();
      requestGetStub = sinon
        .stub(request, 'get')
        .callsFake((props, callback) => {
          callback('bad request', '', [{ id: 'test', name: 'test' }]);
        });

      const app = new App({
        APIAIToken: '123',
        cachePath: './cache',
      });

      const props = {
        update: true,
      };

      return expect(app.start(props)).to.eventually.eq('UPDATE_FAIL');
    });
  });

  describe('handleRequest()', () => {
    it('handles a request', () => {
      const app = new App();
      const body = createLiveSessionApiAppBody();
      body.result.parameters.test = ['testing'];

      mockRequest = new MockRequest(headers, body);
      mockResponse = new MockResponse();

      expect(app.handleRequest(mockRequest, mockResponse)).to.eq(
        'REQUEST_HANDLED');
    });
  });
});
