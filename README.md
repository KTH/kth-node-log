kth-node-log
============

Logging module for Node.js applications.

## Usage

```javascript
const log = require('kth-node-log')

// in application setup, see full options below
log.init({
  console: {
    enabled: true
  }
})

// log usage
log.info('hello from info, log level usually used in setup')
log.warn('error that code handled and can recover from')
log.error({err: err}, 'error that should be fixed in code')
log.fatal('a really bad error that will crash the application')
log.debug({req: req, res: res}, 'log a request and response, basic dev log')
log.trace('granular logging, rarely used')

// child logger
// add custom values to all of the logs
const myLog = log.child({custom:'value'})
myLog.info('hello')
```

## Options

```javascript
log.init({
  // name of the logger, usually the same as application name
  name: 'node-logger',

  // application name, e.g. places-web
  app: 'node-app',

  // usually set this to process.env.NODE_ENV
  env: 'dev',

  // default logging level, can be overridden in stream configs
  level: bunyan.INFO,

  // use bunyan's own serializers
  serializers: {
    req: bunyan.stdSerializers.req,
    res: bunyan.stdSerializers.res,
    err: bunyan.stdSerializers.err
  },

  // include source file, only enable in dev mode
  src: false,

  // enable debug logging
  debugMode: false,

  // stream, log to logstash using the lumberjack protocol
  // see bunyan-lumberjack for more details
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
        // bunyan-lumberjack example is wrong,
        // this method should be called "shouldKeep"
        // return false to drop message, true to keep message
        return entry.bunyanLevel > bunyan.INFO
      }
    }
  },

  // stream, log to stdout using bunyan-format
  // see bunyan-format for more details
  console: {
    enabled: false,
    level: null,
    format: {
      outputMode: 'short'
    }
  },

  // stream, log raw json to stdout
  stdout: {
    enabled: false,
    level: null
  }
})
```
