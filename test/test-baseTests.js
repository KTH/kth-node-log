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
})