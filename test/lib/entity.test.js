// bin/lib/entity

const chai = require('chai');
const { entity } = require('../../bin/lib/entity');

// Constants
const { expect } = chai;
const entry = [
  {
    value: 'test',
    synonyms: ['test', 'testing'],
  },
  {
    value: 'debug',
    synonyms: ['debug', 'debugging'],
  },
];

// Tasks
describe('bin/lib/entity', () => {
  let entityRegistry;
  let entityModule;

  beforeEach(() => {
    entityRegistry = new Map();
    entityModule = entity.bind({ entityRegistry });
  });

  describe('entity()', () => {
    it('add an entity to the registry', () => {
      entityModule('test', entry);
      expect(entityRegistry.has('test')).to.eq(true);
    });

    it('throws an error when entity key is not provide or not string', () => {
      expect(() => entityModule({}, entry))
        .to.throw('Entity key must be a string');
    });

    it('throws an error when no array of entities are provided', () => {
      expect(() => entityModule('test', null))
        .to.throw('Entity expects an array of term objects');
    });

    it('throws an error when adding an entity with duplicate key', () => {
      entityModule('test', entry);
      expect(() => entityModule('test', entry))
        .to.throw('Entity with key already exists: test');
    });
  });
});
