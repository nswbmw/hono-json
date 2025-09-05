import { Hono } from 'hono'
import json from '../index.js'
import { serve } from '@hono/node-server'

const app = new Hono()
app.use(json(app, {
  status: 200, // <- fixed
  success: {
    status: (ctx) => ctx.res.status, // <- code instead of status
    data: (ctx) => ctx.res.json()
  },
  fail: {
    status: (ctx, e) => e.status || e.statusCode || 500, // <- code instead of status
    message: (ctx, e) => e.message
  }
}))

app.get('/', (c) => {
  return c.json({ username: 'username', gender: 'male' })
})

app.get('/error', () => {
  hi()
})

serve(app)
