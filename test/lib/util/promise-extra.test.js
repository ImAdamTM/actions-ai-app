// bin/lib/util/promise-extra

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const Promise = require('../../../bin/lib/util/promise-extra');

chai.use(chaiAsPromised);

// Constants
const { expect } = chai;

// Tasks
const tasks = {
  a() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('A');
      }, 10);
    });
  },
  b() { return new Promise(resolve => resolve('B')); },
  c() { return new Promise(resolve => resolve('C')); },
  d() { return new Promise((resolve, reject) => reject('D')); },
};

describe('bin/lib/util/promise-extra', () => {
  describe('allSync()', () => {
    it('return a completed promise in synchronous order', () => {
      const output = Promise.allSync([
        { fn: tasks.a },
        { fn: tasks.b },
        { fn: tasks.c },
      ]);

      return expect(output).to.eventually.become(['A', 'B', 'C']);
    });

    it('should be rejected', () => {
      const output = Promise.allSync([
        { fn: tasks.d },
      ]);

      return expect(output).to.eventually.be.rejectedWith('D');
    });
  });

  describe('allAsync()', () => {
    it('return a completed promise in asynchronous order', () => {
      const output = Promise.allAsync([
        { fn: tasks.a },
        { fn: tasks.b },
        { fn: tasks.c },
      ]);

      return expect(output).to.eventually.be.fulfilled;
    });

    it('should be rejected', () => {
      const output = Promise.allAsync([
        { fn: tasks.d },
      ]);

      return expect(output).to.eventually.be.rejected;
    });
  });
});
