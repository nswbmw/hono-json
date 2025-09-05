import { Hono } from 'hono'
import json from '../index.js'
import { serve } from '@hono/node-server'

const app = new Hono()
app.use(json(app))

app.get('/', (c) => {
  return c.json({ username: 'username', gender: 'male' })
})

app.get('/_raw', (c) => {
  c._raw = true
  return c.json({ username: 'username', gender: 'male' })
})

serve(app)
