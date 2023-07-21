'use strict'

const mockOnWrite = jest.fn().mockImplementation(msg => msg)
/*
 * utility functions
 */
function buildReq(overrides) {
  const headers = {
    accept: 'application/json',
    api_key: '1234',
    'User-Agent': 'testing-log-with-jest-unit-test',
    ...overrides.headers,
  }
  const req = {
    method: 'GET',
    headers,
    header: jest.fn(field => headers[field]),
    connection: {},
    body: {},
    params: {},
    ...overrides,
  }
  return req
}

function buildRes(overrides = {}) {
  const res = {
    json: jest.fn(() => res).mockName('json'),
    status: jest.fn(() => res).mockName('status'),
    type: jest.fn(() => res).mockName('type'),
    send: jest.fn(() => res).mockName('send'),
    render: jest.fn(() => res).mockName('render'),

    ...overrides,
  }
  return res
}

describe(`Logger`, () => {
  afterAll(() => jest.resetAllMocks())

  let log

  beforeEach(() => {
    jest.resetModules()
    log = require('./index.js')
  })

  afterEach(() => {
    //  Clear require cache so we can reinitialize
    // delete require.cache[require.resolve('../index.js')]
    // log = undefined
  })

  test('can be created', () => {
    expect(log).not.toBeUndefined()
  })

  test('can be initialised', () => {
    log.init()
    expect(log).not.toBeUndefined()
  })

  test('can call logger.child', () => {
    log.init()
    let theError
    try {
      log.child()
    } catch (e) {
      theError = e
    }
    expect(theError).toBeUndefined()
  })

  test('has .trace', () => {
    log.init()
    expect(typeof log.trace).toBe('function')
  })

  test('has .debug', () => {
    log.init()
    expect(typeof log.debug).toBe('function')
  })

  test('has .info', () => {
    log.init()
    expect(typeof log.info).toBe('function')
  })

  test('has .warn', () => {
    log.init()
    expect(typeof log.warn).toBe('function')
  })

  test('has .error', () => {
    log.init()
    expect(typeof log.error).toBe('function')
  })

  test('has .fatal', () => {
    log.init()
    expect(typeof log.fatal).toBe('function')
  })

  test('respects level is set to lower', () => {
    log.init({
      level: 20,
      env: 'development',
      onWrite: mockOnWrite,
    })
    // log.info is level 30
    log.info('Oops!')
    expect(mockOnWrite).toHaveBeenCalledTimes(1)
  })

  test('respects level is set to the same', () => {
    log.init({
      level: 30,
      env: 'development',
      onWrite: mockOnWrite,
    })
    // log.info is level 30
    log.info('Oops same level!')
    expect(mockOnWrite).toHaveBeenCalledTimes(1)
  })

  test('respects level is set to higher ', () => {
    log.init({
      level: 40,
      env: 'development',
      onWrite: mockOnWrite,
    })
    // log.info is level 30
    log.info('Oops should not be displayed!')
    expect(mockOnWrite).not.toHaveBeenCalledTimes(1)
  })

  test('error is logged', () => {
    log.init({
      level: 'warn',
      env: 'development',
      onWrite: msg => {
        expect(JSON.stringify(msg)).toContain('hello')
      },
    })
    log.error(new Error('hello'))
  })

  test('req serializer is run to filter sensitive info', () => {
    log.init({
      level: 'DEBUG',
      env: 'development',
      onWrite: msg => {
        const msgStr = JSON.stringify(msg)
        expect(msgStr).toContain('hello.html')

        expect(msgStr).not.toContain('123456')
        expect(msgStr).not.toContain('secret')
      },
    })

    let req = buildReq({
      url: 'hello.html',
      headers: { api_key: '123456' },
      params: { api_key: '123456', name: 'foo', password: 'secret' },
    })

    log.info({ req })

    req = buildReq({
      url: 'hello.html',
      headers: { api_key: '123456' },
      query: { api_key: '123456', name: 'foo', password: 'secret' },
    })
    log.info({ req })

    req = buildReq({
      url: 'hello.html',
      headers: { api_key: '123456' },
      query: 'api_key=123456',
    })
    log.info({ req })
  })

  test('res serializer is run to filter out to include only status code.', () => {
    log.init({
      level: 40,
      env: 'development',
      onWrite: msg => {
        expect(JSON.stringify(msg)).toContain('200')
        expect(JSON.stringify(msg)).not.toContain('blablablahoppsan')
      },
    })
    const res = buildRes({ statusCode: 200, body: 'blablablahoppsan' })
    log.error({ res })
  })

  test('err serializer is run.', () => {
    log.init({
      level: 40,
      env: 'development',
      onWrite: msg => {
        expect(JSON.stringify(msg)).toContain('hoppsan hejsan')
      },
    })

    log.error({ err: new Error('hoppsan hejsan') })
  })

  test('child log respects log level set to lower', () => {
    log.init({
      level: 20,
      env: 'development',
      onWrite: mockOnWrite,
    })
    const childlog = log.child({ package: 'node-common' })
    childlog.info('hoppsan')
    expect(mockOnWrite).toHaveBeenCalledTimes(1)
  })
  test('child log respects log level set to higher', () => {
    log.init({
      level: 40,
      env: 'development',
      onWrite: mockOnWrite,
    })
    const childlog = log.child({ package: 'node-common' })
    childlog.info('hoppsan')
    expect(mockOnWrite).not.toHaveBeenCalledTimes(1)
  })
})
