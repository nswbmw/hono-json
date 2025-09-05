import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

import { json } from './index.js'

describe('hono-json', () => {
  it('No app', async () => {
    const app = new Hono()
    try {
      app.use(json())
    } catch (e) {
      expect(e.message).toBe('No app')
    }
  })

  it('default', async () => {
    const app = new Hono()
    app.use(json(app))
    app.get('/', (c) => {
      c.status(201)
      return c.json('Hello, Hono!')
    })
    app.get('/error', (c) => {
      throw new HTTPException(400, { message: 'erorr!!!' })
    })
    app.on(['HEAD', 'OPTIONS', 'GET'], '/empty', (c) => {
      if (c.req.method === 'HEAD') {
        c.status(201)
      } else if (c.req.method === 'OPTIONS') {
        c.status(202)
      } else if (c.req.method === 'GET') {
        c.status(203)
      }

      return c.text('')
    })

    const res = await app.request('/')
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({
      code: 201,
      data: 'Hello, Hono!'
    })

    const errorRes = await app.request('/error')
    expect(errorRes.status).toBe(400)
    expect(await errorRes.json()).toEqual({
      code: 400,
      message: 'erorr!!!'
    })

    const headRes = await app.request('/empty', {
      method: 'HEAD'
    })
    expect(headRes.status).toBe(201)

    const optionsRes = await app.request('/empty', {
      method: 'OPTIONS'
    })
    expect(optionsRes.status).toBe(202)
  })

  it('options.status -> function', async () => {
    const app = new Hono()
    app.use(json(app))
    app.get('/', (c) => {
      return c.json('Hello, Hono!')
    })
    app.get('/error', (c) => {
      throw new Error('erorr!!!')
    })
    app.get('/HTTPException', (c) => {
      throw new HTTPException(400, { message: 'HTTPException!!!' })
    })

    const res = await app.request('/')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      code: 200,
      data: 'Hello, Hono!'
    })

    const errorRes = await app.request('/error')
    expect(errorRes.status).toBe(500)
    expect(await errorRes.json()).toEqual({
      code: 500,
      message: 'erorr!!!'
    })

    const HTTPExceptionRes = await app.request('/HTTPException')
    expect(HTTPExceptionRes.status).toBe(400)
    expect(await HTTPExceptionRes.json()).toEqual({
      code: 400,
      message: 'HTTPException!!!'
    })
  })

  it('options.status -> 200', async () => {
    const app = new Hono()
    app.use(json(app, { status: 200 }))
    app.get('/', (c) => {
      c.status(201)
      return c.json('Hello, Hono!')
    })
    app.get('/error', (c) => {
      throw new Error('erorr!!!')
    })
    app.get('/HTTPException', (c) => {
      throw new HTTPException(400, { message: 'HTTPException!!!' })
    })

    const res = await app.request('/')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      code: 201,
      data: 'Hello, Hono!'
    })

    const errorRes = await app.request('/error')
    expect(errorRes.status).toBe(200)
    expect(await errorRes.json()).toEqual({
      code: 500,
      message: 'erorr!!!'
    })

    const HTTPExceptionRes = await app.request('/HTTPException')
    expect(HTTPExceptionRes.status).toBe(200)
    expect(await HTTPExceptionRes.json()).toEqual({
      code: 400,
      message: 'HTTPException!!!'
    })
  })

  it('options.success -> function', async () => {
    const app = new Hono()
    app.use(json(app, {
      success: {
        code: (ctx) => 204,
        data: (ctx) => 'No content'
      }
    }))
    app.get('/', (c) => {
      return c.json('Hello, Hono!')
    })

    const res = await app.request('/')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      code: 204,
      data: 'No content'
    })
  })

  it('options.success -> text', async () => {
    const app = new Hono()
    app.use(json(app, {
      success: {
        code: 204,
        data: 'No content'
      }
    }))
    app.get('/', (c) => {
      return c.json('Hello, Hono!')
    })

    const res = await app.request('/')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      code: 204,
      data: 'No content'
    })
  })

  it('options.fail -> function', async () => {
    const app = new Hono()
    app.use(json(app, {
      fail: {
        code: (ctx) => 410,
        data: (ctx) => 'Gone'
      }
    }))
    app.get('/error', (c) => {
      throw new HTTPException(400, { message: 'erorr!!!' })
    })

    const res = await app.request('/error')
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({
      code: 410,
      data: 'Gone'
    })
  })

  it('options.fail -> text', async () => {
    const app = new Hono()
    app.use(json(app, {
      fail: {
        code: 410,
        data: 'Gone'
      }
    }))
    app.get('/error', (c) => {
      throw new HTTPException(400, { message: 'erorr!!!' })
    })

    const res = await app.request('/error')
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({
      code: 410,
      data: 'Gone'
    })
  })

  it('_raw', async () => {
    const app = new Hono()
    app.use(json(app))
    app.get('/', (c) => {
      c._raw = true
      return c.json('Hello, Hono!')
    })

    const res = await app.request('/')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual('Hello, Hono!')
  })

  it('404', async () => {
    const app = new Hono()
    app.use(json(app))
    app.get('/', (c) => {
      return c.json('Hello, Hono!')
    })

    const res = await app.request('/404')
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({
      code: 404,
      data: '404 Not Found'
    })
  })
})
