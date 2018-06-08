/* eslint-env mocha */
'use strict'
const expect = require('chai').expect

describe('Logger', function () {
  let log

  beforeEach(() => {
    log = require('../index.js')
  })

  afterEach(() => {
    // Clear require cache so we can reinitialize
    delete require.cache[require.resolve('../index.js')]
    log = undefined
  })

  it('can be created', function () {
    expect(log).not.to.equal(undefined)
  })

  it('can be initialised', function () {
    log.init()
    expect(log).not.to.equal(undefined)
  })

  it('can call logger.child', function () {
    log.init()
    let theError
    try {
      log.child()
    } catch (e) {
      theError = e
    }
    expect(theError).to.equal(undefined)
  })

  it('has .trace', function () {
    log.init()
    expect(typeof log.trace).to.equal('function')
  })

  it('has .debug', function () {
    log.init()
    expect(typeof log.debug).to.equal('function')
  })

  it('has .info', function () {
    log.init()
    expect(typeof log.info).to.equal('function')
  })

  it('has .warn', function () {
    log.init()
    expect(typeof log.warn).to.equal('function')
  })

  it('has .error', function () {
    log.init()
    expect(typeof log.error).to.equal('function')
  })

  it('has .fatal', function () {
    log.init()
    expect(typeof log.fatal).to.equal('function')
  })

  it('respects level', function () {
    log.init({
      level: 40,
      env: 'development',
      onWrite: (msg) => {
        expect(msg).to.equal(undefined)
      }
    })

    // log.info is level 30
    log.info('Oops!')
  })
})
