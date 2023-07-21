const bunyan = require('bunyan')
const bunyanFormat = require('bunyan-format')

/* Print to console */
function onWrite(c: string) {
  if (c[c.length - 1] === '\n') {
    console.log(c.substring(0, c.length - 1))
  } else {
    console.log(c)
  }
}
function sanitize(val: any) {
  const mask = ['api_key', 'apikey', 'key', 'password', 'pwd']
  if (val && typeof val === 'object') {
    const rval = {}
    for (const key of Object.keys(val)) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        if (mask.includes(key.toLowerCase())) {
          rval[key] = '*******'
        } else {
          rval[key] = val[key]
        }
      }
    }
    return rval
  }
  if (val && typeof val === 'string') {
    let arr = []
    arr = val
      .split(',')
      .filter(v => v.trim())
      .map(v => {
        if (v.includes('=')) {
          const [p, pv] = v.split('=')
          if (mask.includes(p.toLowerCase())) {
            return `${p}=********`
          }
          return `${p}=${pv}`
        }
        return v
      })
    return JSON.stringify(arr)
  }
  return val
}
// Serialize an HTTP request.
function reqSerializer(req: any) {
  if (!req || !req.connection) return {}

  const rval = {
    method: req.method,
    url: req.originalUrl || req.url,
    accept: req.header('Accept'),
    guid: req.header('Request-Guid'),
    agent: req.header('User-Agent'),
    hostname: req.hostname,
    referer: req.header('Referer'),
    path: req.path,
    protocol: req.protocol,
    secure: req.secure,
    params: sanitize(req.params),
    query: sanitize(req.query),
    remoteAddress: req.connection.remoteAddress,
    remotePort: req.connection.remotePort,
  }

  return rval
}

// Serialize an HTTP response.
function resSerializer(res) {
  if (!res || !res.statusCode) return {}
  const rval = {
    statusCode: res.statusCode,
  }

  return rval
}

const defaults = {
  name: 'node-log',
  env: process.env.NODE_ENV,
  level: bunyan.INFO,
  // Using
  // https://github.com/trentm/node-bunyan#recommendedbest-practice-fields
  serializers: { err: bunyan.stdSerializers.err, req: reqSerializer, res: resSerializer },
}

type LoggerInitOptions = {

}

function initLogger(inpOptions) {
  const options = { ...defaults, ...inpOptions }

  const loggerOptions = {
    name: options.name,
    level: options.level,
    serializers: options.serializers,
  }

  if (options.env === undefined || options.env === 'development' || options.env === 'test') {
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
  console.warn(
    'You are using package "@kth/log" before/without init(). ' +
      'This might be fine in test environments but is most likely unwanted when running your application.'
  )
  Global.messageShown = true
}
