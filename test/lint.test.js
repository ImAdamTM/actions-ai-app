// Lint

const lint = require('mocha-eslint');

const paths = ['bin', 'test'];
const options = {
  timeout: 10000,
  slow: 3000,
  strict: true,
};

lint(paths, options);
