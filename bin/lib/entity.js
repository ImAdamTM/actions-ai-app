// Entity

const chalk = require('chalk');
const debug = require('./util/debug')('entity');

const DEFAULTS = {
  ENTITY: {
    isEnum: false,
    automatedExpansion: false,
  },
};

/**
 * Add an entity configuration to the registry for API.AI insertion
 *
 * @param {Map} registry the app registry for entities
 * @param {String} key the unique name for the entity
 * @param {Array} terms the array of terms to enter into the entity
 * @private
 */
const registerEntity = (registry, key, terms, props) => {
  const options = Object.assign({}, DEFAULTS.ENTITY, props);
  registry.set(
    key,
    Object.assign({}, DEFAULTS.ENTITY, options, {
      name: key,
      entries: terms,
    }));
};

/**
 * Adds an entity to the registry for API.AI
 *
 * @param  {type} key the unique key for the entity
 * @param  {type} terms the terms for the entity (refer to API.AI spec)
 * @private
 */
exports.entity = function entity(key, terms, props) {
  if (this.started) {
    debug(
      chalk.bold(
        `Entities may only be added before start() is called! ('${key}')`),
      'red');
    return this;
  }

  if (typeof key !== 'string') {
    throw new Error('Entity key must be a string');
  }

  if (this.entityRegistry.get(key)) {
    throw new Error(`Entity with key already exists: ${key}`);
  }

  if (!Array.isArray(terms)) {
    throw new Error('Entity expects an array of term objects');
  }

  registerEntity(this.entityRegistry, key, terms, props);

  return this;
};
