// src/utils/logger.js

const log = (message, data = null) => {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  if (data) console.log(data);
};

const warn = (message, data = null) => {
  console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  if (data) console.warn(data);
};

const error = (message, data = null) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
  if (data) console.error(data);
};

module.exports = {
  log,
  warn,
  error,
};
