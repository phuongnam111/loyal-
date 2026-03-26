/**
 * Helper utilities
 */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pick(obj, keys) {
  return keys.reduce((acc, k) => {
    if (obj.hasOwnProperty(k)) acc[k] = obj[k];
    return acc;
  }, {});
}

function omit(obj, keys) {
  const set = new Set(keys);
  return Object.fromEntries(Object.entries(obj).filter(([k]) => !set.has(k)));
}

function randomId(prefix = '') {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}

module.exports = { sleep, pick, omit, randomId };
