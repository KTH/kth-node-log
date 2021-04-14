/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

const bunyan = require('bunyan')
const bunyanFormat = require('bunyan-format')

const defaults = {
  name: 'kth-node-log',
  env: process.env.LOGGING_OUTPUT_FORMAT || process.env.NODE_ENV,
  level: 'debug',
  // Using
  // https://github.com/trentm/node-bunyan#recommendedbest-practice-fields
  serializers: { err: bunyan.stdSerializers.err },
}

/* Print to console */
function onWrite(c) {
  if (c[c.length - 1] === '\n') {
    // eslint-disable-next-line no-console
    console.log(c.substr(0, c.length - 1))
  } else {
    // eslint-disable-next-line no-console
    console.log(c)
  }
}

function initLogger(inpOptions) {
  const options = { ...defaults, ...inpOptions }

  const loggerOptions = {
    name: options.name,
    level: options.level,
    serializers: options.serializers,
  }

  if (options.env === undefined || options.env === 'development') {
    // Write to std out when not in production mode
    loggerOptions.stream = bunyanFormat({ outputMode: 'short' }, { write: options.onWrite || onWrite })
  }

  const logger = bunyan.createLogger(loggerOptions)

  // Mutating module.exports to maintian compatibility with old apps
  ;['debug', 'info', 'warn', 'trace', 'fatal', 'error', 'child'].forEach(key => {
    module.exports[key] = logger[key].bind(logger)
  })
  module.exports.init = () => logger.info("kth-node-log already initialized, won't do it again")
}

/**
 * Bunyan logger wrapper
 * @type {{init:Function,child:Function,trace:Function,debug:Function,info:Function,warn:Function,error:Function,fatal:Function}}
 */
module.exports = {
  init: initLogger,

  debug: _showMessageAboutMissingInit,
  info: _showMessageAboutMissingInit,
  warn: _showMessageAboutMissingInit,
  trace: _showMessageAboutMissingInit,
  fatal: _showMessageAboutMissingInit,
  error: _showMessageAboutMissingInit,
  child: () => ({
    init: initLogger,
    debug: _showMessageAboutMissingInit,
    info: _showMessageAboutMissingInit,
    warn: _showMessageAboutMissingInit,
    trace: _showMessageAboutMissingInit,
    fatal: _showMessageAboutMissingInit,
    error: _showMessageAboutMissingInit,
  }),
}

const Global = {
  messageShown: false,
}

function _showMessageAboutMissingInit() {
  if (Global.messageShown) {
    return
  }
  // eslint-disable-next-line no-console
  console.warn(
    'You are using package "kth-node-log" before/without init(). ' +
      'This might be fine in test environments but is most likely unwanted when running your application.'
  )
  Global.messageShown = true
}
