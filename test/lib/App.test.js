// bin/lib/App

const chai = require('chai');
const { ApiAiApp } = require('actions-on-google');
const App = require('../../bin/lib/App');
const {
  MockRequest,
  MockResponse,
  createLiveSessionApiAppBody,
} = require('../test.util/actions-on-google');

// Constants
const { expect } = chai;

// Tasks
describe('bin/lib/App', () => {
  let app;
  let mockRequest;
  let mockResponse;
  const headers = {
    'Content-Type': 'application/json',
    'google-assistant-api-version': 'v2',
  };

  beforeEach(() => {});

  it('creates a new App()', () => {
    mockRequest = new MockRequest(headers, { result: {} });
    mockResponse = new MockResponse();

    app = new App({
      request: mockRequest,
      response: mockResponse,
    });

    expect(app).to.be.instanceOf(ApiAiApp);
  });

  it('restores contexts from supplied list', () => {
    const body = createLiveSessionApiAppBody();

    mockRequest = new MockRequest(headers, body);
    mockResponse = new MockResponse();

    app = new App({
      request: mockRequest,
      response: mockResponse,
    });

    expect(app.restoreContexts(['test'])).to.deep.eq(['test']);
  });

  it('reapplies current contexts', () => {
    const body = createLiveSessionApiAppBody();

    mockRequest = new MockRequest(headers, body);
    mockResponse = new MockResponse();

    app = new App({
      request: mockRequest,
      response: mockResponse,
    });

    expect(app.restoreContexts()).to.deep.eq([]);
  });

  describe('getArgumentString()', () => {
    it('convert an array argument to string', () => {
      const body = createLiveSessionApiAppBody();
      body.result.parameters.test = ['testing'];

      mockRequest = new MockRequest(headers, body);
      mockResponse = new MockResponse();

      app = new App({
        request: mockRequest,
        response: mockResponse,
      });

      expect(app.getArgumentString('test')).to.equal('testing');
    });

    it('returns empty string if argument is empty array', () => {
      const body = createLiveSessionApiAppBody();
      body.result.parameters.test = [];

      mockRequest = new MockRequest(headers, body);
      mockResponse = new MockResponse();

      app = new App({
        request: mockRequest,
        response: mockResponse,
      });

      expect(app.getArgumentString('test')).to.equal('');
    });

    it('returns empty string if argument not found', () => {
      const body = createLiveSessionApiAppBody();

      mockRequest = new MockRequest(headers, body);
      mockResponse = new MockResponse();

      app = new App({
        request: mockRequest,
        response: mockResponse,
      });

      expect(app.getArgumentString('test')).to.equal('');
    });

    it('returns original if the argument is already a string', () => {
      const body = createLiveSessionApiAppBody();
      body.result.parameters.test = 'test';

      mockRequest = new MockRequest(headers, body);
      mockResponse = new MockResponse();

      app = new App({
        request: mockRequest,
        response: mockResponse,
      });

      expect(app.getArgumentString('test')).to.equal('test');
    });
  });
});
