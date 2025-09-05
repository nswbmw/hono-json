export default function honoJsonFn (app, options = {}) {
  if (!app) {
    throw new Error('No app')
  }

  const statusSchema = options.status || ((ctx, e) => {
    return e
      ? (e.status || e.statusCode || 500)
      : ctx.res.status
  })
  const successSchema = options.success || {
    code: (ctx) => ctx.res.status,
    data: (ctx) => {
      const contentType = ctx.res.headers.get('Content-Type')
      if (contentType && contentType.toLowerCase().includes('json')) {
        return ctx.res.json()
      }
      return ctx.res.text()
    }
  }
  const failSchema = options.fail || {
    code: (ctx, e) => e.status || e.statusCode || 500,
    message: (ctx, e) => e.message
  }

  app.onError(async (err, ctx) => {
    const body = {}

    for (const key in failSchema) {
      const fn = failSchema[key]
      if (typeof fn === 'function') {
        body[key] = await fn(ctx, err)
      } else {
        body[key] = fn
      }
    }

    if (typeof statusSchema === 'function') {
      ctx.status(await statusSchema(ctx, err))
    } else {
      ctx.status(statusSchema)
    }

    return ctx.json(body)
  })

  return async function honoJson (ctx, next) {
    await next()

    if (ctx._raw) return
    if (ctx.error) return
    if (['options', 'head'].includes(ctx.req.method.toLowerCase())) {
      return
    }

    const body = {}
    for (const key in successSchema) {
      const fn = successSchema[key]
      if (typeof fn === 'function') {
        body[key] = await fn(ctx)
      } else {
        body[key] = fn
      }
    }

    let status
    if (typeof statusSchema === 'function') {
      status = await statusSchema(ctx, ctx.error)
    } else {
      status = statusSchema
    }

    ctx.res = Response.json(body, {
      status,
      headers: ctx.res.headers
    })
  }
}
