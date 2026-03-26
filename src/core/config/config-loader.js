/**
 * Configuration loader - merges base + environment configs + .env overrides
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.resolve(__dirname, '../../../config/environments');

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf-8');
  const vars = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    vars[key] = value;
  }
  return vars;
}

function loadConfig(env) {
  const envName = env || process.env.TEST_ENV || process.env.NODE_ENV || 'dev';

  // Load base config
  const basePath = path.join(CONFIG_DIR, 'base.json');
  const base = fs.existsSync(basePath) ? loadJson(basePath) : {};

  // Load environment-specific config
  const envPath = path.join(CONFIG_DIR, `${envName}.json`);
  const envConfig = fs.existsSync(envPath) ? loadJson(envPath) : {};

  // Load .env file overrides
  const dotenvPath = path.resolve(__dirname, '../../../.env');
  const dotenv = loadEnvFile(dotenvPath);

  // Merge: base < env-specific < .env overrides
  const merged = {
    ...base,
    ...envConfig,
    common: {
      ...(base.common || {}),
      ...(envConfig.common || {}),
    },
    api: {
      ...(base.api || {}),
      ...(envConfig.api || {}),
    },
    auth: {
      ...(base.auth || {}),
      ...(envConfig.auth || {}),
    },
    // .env overrides
    baseUrl: dotenv.API_BASE_URL || envConfig.baseUrl || base.baseUrl || '',
    timeout: parseInt(dotenv.API_TIMEOUT, 10) || base.common?.timeout || 30000,
    apiKey: dotenv.API_KEY || '',
    logLevel: dotenv.LOG_LEVEL || base.common?.logLevel || 'info',
    retryAttempts: parseInt(dotenv.RETRY_ATTEMPTS, 10) || base.common?.retryAttempts || 3,
    retryDelay: parseInt(dotenv.RETRY_DELAY, 10) || 1000,
    // Auth credentials from .env
    authUsername: dotenv.AUTH_USERNAME || '',
    authPassword: dotenv.AUTH_PASSWORD || '',
    partnerApiKey: dotenv.PARTNER_API_KEY || '',
  };

  return Object.freeze(merged);
}

// Singleton config
let _config = null;

function getConfig(env) {
  if (!_config) {
    _config = loadConfig(env);
  }
  return _config;
}

function resetConfig() {
  _config = null;
}

module.exports = { loadConfig, getConfig, resetConfig, loadJson, loadEnvFile };
