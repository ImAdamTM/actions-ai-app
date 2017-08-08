// Debug

const chalk = require('chalk');
const dateFormat = require('dateformat');

// Constants
const DEFAULT_COLOR = 'cyan';

// Generate a timestamp
const getTimestamp = () =>
  `[${chalk.gray(dateFormat(Date.now(), 'HH:MM:ss'))}]`;

// Read the env.NODE_DEBUG to determine which logs are to be used
/* istanbul ignore next */
const getNamespace = () => {
  let namespaces = process.env.ACTIONS_AI_APP_DEBUG;
  const skips = [];
  const names = [];
  const split = (namespaces || '').split(/[\s,]+/);
  const len = split.length;

  for (let i = 0; i < len; i += 1) {
    namespaces = split[i].replace(/\*/g, '.*?');

    if (namespaces[0] === '-') {
      skips.push(new RegExp(`^${namespaces.substr(1)}$`));
    } else {
      names.push(new RegExp(`^${namespaces}$`));
    }
  }

  return { skips, names };
}; /* istanbul ignore next */

/**
 * Used in conjunction with `debug()`. Before logging is permitted, we first
 * check the supplied key to see whether it matches the available namespaces
 * @private
 */ const matchNamespace = (name) => {
  const namespaced = getNamespace();
  let i;
  let len;

  for (i = 0, len = namespaced.skips.length; i < len; i += 1) {
    if (namespaced.skips[i].test(name)) return false;
  }

  for (i = 0, len = namespaced.names.length; i < len; i += 1) {
    if (namespaced.names[i].test(name)) return true;
  }

  return false;
}; /* istanbul ignore next */

/**
 * Used in conjunction with `debug()` to determine an applicable console
 * color for log output when a color is specified
 * @private
 */ const getColor = (
  color,
  def = DEFAULT_COLOR) => {
  if (chalk[color]) return { match: true, color };
  return { match: false, color: def };
};

/* istanbul ignore next */
const log = (...args) => {
  if (process.env.NODE_ENV !== 'test') console.log(...args);
}; /* istanbul ignore next */

/**
 * An internal application logger that supports namespaced logging
 * @private
 */ const debug = function debug(
  ...args
) {
  if (!process.env.ACTIONS_AI_APP_DEBUG) return;

  const key = `${process.env.ACTIONS_AI_APP_NAMESPACE}:${this.key}`;

  if (!this.matched) {
    this.match = matchNamespace(key);
    this.matched = true;
  }
  if (!this.match) return;

  const theme = getColor(args[args.length - 1], this.color);
  const timestamp = getTimestamp();
  if (theme.match) args.pop();

  log(timestamp, chalk[theme.color](`[${key}]`), ...args);
};

/**
 * Export
 */
module.exports = (key, color) =>
  debug.bind({
    key,
    matched: false,
    match: true,
    color: color || DEFAULT_COLOR,
  });
