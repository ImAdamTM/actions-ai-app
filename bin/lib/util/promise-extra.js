// Promise Extra

/**
 * allSync - Runs a series of promises synchronously, expects to receive
 * an array of objects.
 *
 * @param {array} task - array of tasks (e.g. [{fn:this.task, args:[]}])
 * @param {object} context - the context that the tasks are executed in
 * @return {Promise}
 */
Promise.allSync = (tasks, context) => {
  const final = [];

  return new Promise((resolve, reject) => {
    tasks.reduce((cur, next) => cur.then((res) => {
      final.push(res);
      const args = next.args || [];

      return next.fn.bind(context, ...args)();
    }), Promise.resolve())
      .then((...res) => {
        final.shift();

        resolve([...final, ...res]);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * allAsync - Runs a series of promises asynchronously, expects to receive
 * an array of objects.
 *
 * @param {array} task - array of tasks (e.g. [{fn:this.task, args:[]}])
 * @param {object} context - the context that the tasks are executed in
 * @return {Promise}
 */
Promise.allAsync = (tasks, context) => {
  const final = tasks.map((task) => {
    const args = task.args || [];
    return task.fn.bind(context, ...args)();
  });

  return new Promise((resolve, reject) => {
    Promise
      .all(final)
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
};

module.exports = Promise;
