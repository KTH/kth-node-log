'use strict'

/*
 Usage:

 var log = require('kth-node-log')

 log.init({
  ...
 })

 log.info('hello from info')

 */

const bunyan = require('bunyan')
const bunyanFormat = require('bunyan-format')

var defaults = {
  name: 'kth-node-log',
  env: process.env.NODE_ENV,
  level: 'debug',
  // Using
  // https://github.com/trentm/node-bunyan#recommendedbest-practice-fields
  serializers: { err: bunyan.stdSerializers.err }
}

/* Print to console */
function onWrite (c) {
  if (c[c.length - 1] === '\n') {
    console.log(c.substr(0, c.length - 1))
  } else {
    console.log(c)
  }
}

function initLogger (inpOptions) {
  let options = Object.assign({}, defaults, inpOptions)

  let loggerOptions = {
    name: options.name,
    level: options.level,
    serializers: options.serializers
  }

  if (options.env === undefined || options.env === 'development') {
    // Write to std out when not in production mode
    loggerOptions['stream'] = bunyanFormat({ outputMode: 'short' }, { write: onWrite })
  }

  let logger = bunyan.createLogger(loggerOptions)

  // Mutating module.exports to maintian compatibility with old apps
  ;['debug', 'info', 'warn', 'trace', 'fatal', 'error', 'child'].forEach((key) => {
    module.exports[key] = logger[key].bind(logger)
  })
  module.exports.init = () => logger.info('kth-node-log already initialized, won\'t do it again')
}

/**
 * Bunyan logger wrapper
 * @type {{init:Function,child:Function,trace:Function,debug:Function,info:Function,warn:Function,error:Function,fatal:Function}}
 */
module.exports = {
  init: initLogger
}
