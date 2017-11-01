/* eslint-env mocha */
'use strict'
const expect = require('chai').expect

describe('Logger', function () {
  it('can be created', function () {
    const log = require('../index.js')
    expect(log).not.to.equal(undefined)
  })

  it('can be initialised', function () {
    const log = require('../index.js')
    log.init()
    expect(log).not.to.equal(undefined)
  })

  it('can call logger.child', function () {
    const log = require('../index.js')
    let theError
    try {
      log.child()
    } catch (e) {
      theError = e
    }
    expect(theError).to.equal(undefined)
  })

  it('has .trace', function () {
    const log = require('../index.js')
    expect(typeof log.trace).to.equal('function')
  })

  it('has .debug', function () {
    const log = require('../index.js')
    expect(typeof log.debug).to.equal('function')
  })

  it('has .info', function () {
    const log = require('../index.js')
    expect(typeof log.info).to.equal('function')
  })

  it('has .warn', function () {
    const log = require('../index.js')
    expect(typeof log.warn).to.equal('function')
  })

  it('has .error', function () {
    const log = require('../index.js')
    expect(typeof log.error).to.equal('function')
  })

  it('has .fatal', function () {
    const log = require('../index.js')
    expect(typeof log.fatal).to.equal('function')
  })
})
