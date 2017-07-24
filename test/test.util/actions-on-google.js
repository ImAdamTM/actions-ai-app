// Imports available for `actions-on-google` tests

const fakeTimeStamp = '2017-01-01T12:00:00';
const fakeSessionId = '0123456789101112';
const fakeIntentId = '1a2b3c4d-5e6f-7g8h-9i10-11j12k13l14m15n16o';
const fakeApiAiBodyRequestId = '1a2b3c4d-5e6f-7g8h-9i10-11j12k13l14m15n16o';
const fakeUserId = 'user123';
const fakeConversationId = '0123456789';

const apiAiAppRequestBodyNewSession = () => ({
  lang: 'en',
  status: {
    errorType: 'success',
    code: 200,
  },
  timestamp: fakeTimeStamp,
  sessionId: fakeSessionId,
  result: {
    parameters: {
      city: 'Rome',
      name: 'Ana',
    },
    contexts: [],
    resolvedQuery: 'my name is Ana and I live in Rome',
    source: 'agent',
    score: 1.0,
    speech: '',
    fulfillment: {
      messages: [
        {
          speech: 'Hi Ana! Nice to meet you!',
          type: 0,
        },
      ],
      speech: 'Hi Ana! Nice to meet you!',
    },
    actionIncomplete: false,
    action: 'greetings',
    metadata: {
      intentId: fakeIntentId,
      webhookForSlotFillingUsed: 'false',
      intentName: 'greetings',
      webhookUsed: 'true',
    },
  },
  id: fakeApiAiBodyRequestId,
  originalRequest: {
    source: 'google',
    data: {
      inputs: [
        {
          raw_inputs: [
            {
              query: 'my name is Ana and I live in Rome',
              input_type: 2,
            },
          ],
          intent: 'assistant.intent.action.TEXT',
          arguments: [
            {
              text_value: 'my name is Ana and I live in Rome',
              raw_text: 'my name is Ana and I live in Rome',
              name: 'text',
            },
          ],
        },
      ],
      user: {
        user_id: fakeUserId,
        locale: 'en-US',
      },
      conversation: {
        conversation_id: fakeConversationId,
        type: 1,
        conversation_token: '[]',
      },
    },
  },
});

exports.MockRequest = class {
  constructor(headers, body) {
    if (headers) {
      this.headers = headers;
    } else {
      this.headers = {};
    }
    if (body) {
      this.body = body;
    } else {
      this.body = {};
    }
  }

  get(header) {
    return this.headers[header];
  }
};

exports.MockResponse = class {
  constructor() {
    this.statusCode = 200;
    this.headers = {};
  }

  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  }

  send(body) {
    this.body = body;
    return this;
  }

  append(header, value) {
    this.headers[header] = value;
    return this;
  }
};

exports.createLiveSessionApiAppBody = () => {
  const tmp = apiAiAppRequestBodyNewSession();
  tmp.originalRequest.data.conversation.type = 2;
  return tmp;
};
