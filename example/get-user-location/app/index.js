// App

const express = require('express');
const bodyParser = require('body-parser');
const { app } = require('./ai');

// Import our intents
require('./intents');

const server = express();

server
  .use(bodyParser.json({ type: 'application/json' }))
  .get('/', (req, res) => res.status(400).json({
    message: 'Invalid request',
  }))
  .post('/', app.handleRequest);

app.start({
  update: process.env.NODE_ENV !== 'production',
  clean: process.env.NODE_ENV !== 'production',
  cleanForceSync: process.env.NODE_ENV !== 'production',
})
  .then(() => {
    server.listen(8000, () => {
      console.log('Server running on port: 8000');
    });
  });
