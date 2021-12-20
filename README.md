# @kth/log

Logging module for Node.js applications.

## Usage

The package will respect NODE_ENV and output serialized JSON in production
and use ordinary output for development.

The package uses bunyan.stdSerializers.err for err and provides serializers for req and res objects. Only subset of fields are displayed by these serializers.

### In your application

```javascript
const log = require('@kth/log')

// in application setup, see full options below
log.init({
  name: 'node-app',
  level: 'warn',
})

// log usage
log.info('hello from info, log level usually used in setup')
log.warn('error that code handled and can recover from')
log.error({ err: err }, 'error that should be fixed in code')
log.fatal('a really bad error that will crash the application')
log.debug({ req: req, res: res }, 'log a request and response, basic dev log')
log.trace('granular logging, rarely used')

// child logger
// add custom values to all of the logs
const myLog = log.child({ custom: 'value' })
myLog.info('hello')
```

## Options

```javascript
log.init({
  // name of the logger, usually the same as application name, default is 'node-log'
  name: 'node-app',

  // If developement or test, the output is sent to stdout (console) using Bunyan-format 'short', default value is retrieved from process.env.NODE_ENV
  env: 'development',

  // default logging level is INFO
  level: 'debug',

  // Provide a custom serializer if necessary, default serializer for err, req and res are included in the package.
  serializers: {
    err: customSerializer,
  },
})
```
