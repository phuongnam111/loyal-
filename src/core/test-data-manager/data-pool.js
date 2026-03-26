/**
 * Data pool for managing test data lifecycle
 */

class DataPool {
  constructor() {
    this.pool = new Map();
  }

  add(key, data) {
    const existing = this.pool.get(key) || [];
    this.pool.set(key, [...existing, ...(Array.isArray(data) ? data : [data])]);
  }

  get(key, index = 0) {
    const items = this.pool.get(key);
    return items ? items[index] : null;
  }

  take(key) {
    const items = this.pool.get(key);
    if (!items?.length) return null;
    const [item] = items.splice(0, 1);
    this.pool.set(key, items);
    return item;
  }

  clear(key) {
    if (key) this.pool.delete(key);
    else this.pool.clear();
  }

  size(key) {
    const items = this.pool.get(key);
    return items ? items.length : 0;
  }
}

module.exports = { DataPool };
