// API.AI

/**
 * Compile the `userSays` data per api.ai spec
 * @param  {Mixed} statement the statement to convert
 * @return {Object} the resulting data
 * @private
 */
exports.compileUserSays = function compileUserSays(statement) {
  if (typeof statement === 'string') {
    const reg = /@{([^}]+)\}/g;
    const str = statement;
    const out = [];
    let index = 0;
    let exec = reg.exec(str);

    while (exec !== null) {
      if (index !== exec.index) {
        out.push({
          text: str.substring(index, exec.index),
        });
      }

      const entity = /@{([^}]+)\}/g
        .exec(str.substring(exec.index, reg.lastIndex))[1]
        .split(':');

      // When using a `sys` (default) entity, we need to adjust the format
      if (entity[0].indexOf('sys.') > -1) {
        out.push({
          text: entity[1],
          alias: entity[0].split('sys.')[1],
          meta: `@${entity[0]}`,
        });
      } else {
        out.push({
          text: entity[1],
          alias: entity[0],
          meta: `@${entity[0]}`,
        });
      }

      const found = this.entities.find(item => item === entity[0]);

      if (!found) {
        this.entities.push(entity[0]);

        if (entity[0].indexOf('sys.') > -1) {
          this.output.responses[0].parameters.push({
            dataType: `@${entity[0]}`,
            name: entity[0].split('sys.')[1],
            value: `$${entity[0].split('sys.')[1]}`,
          });
        } else {
          this.output.responses[0].parameters.push({
            dataType: `@${entity[0]}`,
            name: entity[0],
            value: `$${entity[0]}`,
          });
        }
      }

      index = reg.lastIndex;
      exec = reg.exec(str);
    }

    if (index !== str.length) {
      out.push({
        text: str.substring(index, str.length),
      });
    }

    return {
      data: out,
      isTemplate: false,
      count: 0,
    };
  }

  return statement;
};

/**
 * Configures an intent config into a valid API.AI data object, per the
 * intents specification.
 *
 * @param {String} key the unique key to identify the intent
 * @param {Object} config the configuration for the intent. Refer to API.AI spec
 * @return {Object} returns the configured object
 * @private
 */
exports.configureIntent = (key, config) => {
  const output = Object.assign(
    {
      id: key,
      name: key,
      auto: true,
      responses: [
        {
          resetContexts: false,
          action: key,
          parameters: [],
        },
      ],
      contexts: [],
      affectedContexts: [],
      userSays: [],
      webhookUsed: true,
      webhookForSlotFilling: true,
      fallbackIntent: false,
      priority: 500000,
    },
    config);

  const entities = [];

  output.responses[0].affectedContexts = output.affectedContexts;
  const compile = exports.compileUserSays.bind({
    output,
    entities,
  });

  output.userSays = output.userSays.map(compile);

  return output;
};
