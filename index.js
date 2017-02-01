'use strict'

/*
 Usage:

 var log = require('kth-node-log')

 log.init({
  console: {
    enabled: true
  }
 })

 log.info('hello from info')

 */

const bunyan = require('bunyan')
const _ = require('lodash')
const format = require('bunyan-format')
const lumberjack = require('bunyan-lumberjack')

let levels = [ 'trace', 'debug', 'info', 'warn', 'error', 'fatal' ]
let logger = null
let log = {}

const defaults = {
  name: 'node-logger',
  app: 'node-app',
  env: 'dev',
  level: bunyan.INFO,
  serializers: {
    req: bunyan.stdSerializers.req,
    res: bunyan.stdSerializers.res,
    err: bunyan.stdSerializers.err
  },
  src: false,
  debugMode: false,
  logstash: {
    enabled: false,
    level: null,
    tlsOptions: {
      host: '',
      port: 0,
      ca: []
    },
    lumberjackOptions: {
      maxQueueSize: 500,
      allowDrop: function (entry) {
        // example is wrong, this method should be called "allowKeep"
        // return false to drop message, true to keep message
        return entry.bunyanLevel > bunyan.INFO
      }
    }
  },
  console: {
    enabled: false,
    level: null,
    format: {
      outputMode: 'short'
    }
  },
  stdout: {
    enabled: false,
    level: null
  }
}

function init (options, optionalConfiguration = {}) {
  if (logger) {
    logger.info('log.init called more than once')
  }

  const streams = []
  options = _.defaultsDeep(options, defaults)

  if (options.stdout.enabled) {
    streams.push({
      level: options.stdout.level || options.level,
      stream: process.stdout
    })
  }

  if (options.console.enabled) {
    streams.push({
      level: options.console.level || options.level,
      stream: format(options.console.format)
    })
  }

  if (options.logstash.enabled) {
    const stream = lumberjack({
      tlsOptions: options.logstash.tlsOptions,
      lumberjackOptions: options.logstash.lumberjackOptions
    })

    stream.on('connect', () => {
      if (options.debugMode) {
        console.log('lumberjack connected')
      }
    })

    stream.on('dropped', count => {
      if (options.debugMode) {
        console.error('lumberjack dropped', count, 'messages')
      }
    })

    stream.on('disconnect', err => {
      if (options.debugMode) {
        console.warn('lumberjack disconnected', err)
      }
    })

    streams.push({
      level: options.logstash.level || options.level,
      type: 'raw',
      stream: stream
    })
  }

  // Default to console if no streams are supplied
  if (streams.length === 0) {
    streams.push({
      level: options.level,
      stream: format(options.console.format)
    })
  }

  const logConfiguration = {
    name: options.name,
    app: options.app,
    env: options.env,
    level: options.level,
    serializers: options.serializers,
    src: options.src,
    streams: streams
  }

  for (var key in optionalConfiguration) {
    if (optionalConfiguration.hasOwnProperty(key)) {
      logConfiguration[key] = optionalConfiguration[key]
    }
  }

  logger = bunyan.createLogger(logConfiguration)

  log.trace('log initialized with configuration',logConfiguration)

  return logger
}

function createLogFunction (level) {
  return function () {
    if (!logger) {
      throw new Error('Logger is not initialized.')
    }

    return logger[ level ].apply(logger, arguments)
  }
}

function child (options) {
  if (!logger) {
    throw new Error('Logger is not initialized.')
  }

  return logger.child(options)
}

levels.forEach(level => {
  log[level] = createLogFunction(level)
})

log.init = init
log.child = child

/**
 * Bunyan logger wrapper
 * @type {{init:Function,child:Function,trace:Function,debug:Function,info:Function,warn:Function,error:Function,fatal:Function}}
 */
module.exports = log
