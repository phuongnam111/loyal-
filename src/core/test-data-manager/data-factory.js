/**
 * Data factory for generating test data
 */

class DataFactory {
  constructor(generators = {}) {
    this.generators = generators;
  }

  register(name, generator) {
    this.generators[name] = generator;
  }

  create(name, overrides = {}) {
    const generator = this.generators[name];
    if (!generator) throw new Error(`Unknown data type: ${name}`);
    const base = typeof generator === 'function' ? generator() : { ...generator };
    return { ...base, ...overrides };
  }

  createMany(name, count, overrides = {}) {
    return Array.from({ length: count }, () => this.create(name, overrides));
  }
}

module.exports = { DataFactory };
