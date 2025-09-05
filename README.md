## hono-json

A Hono middleware that formats JSON responses for consistent API output.

### Install

```sh
$ npm i hono-json --save
```

### Example

```js
import { Hono } from 'hono'
import json from 'hono-json'
import { serve } from '@hono/node-server'

const app = new Hono()
app.use(json(app))

app.get('/', (c) => {
  return c.json({ username: 'username', gender: 'male' })
})

app.get('/error', () => {
  hi()
})

serve(app)
```

Request `/` and `/error`:

```js
GET / -> 200

{
  code: 200,
  data: { username: 'username', gender: 'male' }
}
```

```js
GET /error -> 500

{
  code: 500,
  message: 'hi is not defined'
}
```

### Custom fields

Default:

```js
app.use(json(app, {
  status: (ctx, e) => {
    return e
      ? (e.status || e.statusCode || 500)
      : ctx.res.status
  },
  success: {
    code: (ctx) => ctx.res.status,
    data: (ctx) => ctx.res.json()
  },
  fail: {
    code: (ctx, e) => e.status || e.statusCode || 500,
    message: (ctx, e) => e.message
  }
}))
```

Customize return status and fields:

```js
import { Hono } from 'hono'
import json from 'hono-json'
import { serve } from '@hono/node-server'

const app = new Hono()
app.use(json(app, {
  status: 200, // <- fixed
  success: {
    status: (ctx) => ctx.res.status, // <- status instead of code
    data: (ctx) => ctx.res.json()
  },
  fail: {
    status: (ctx, e) => e.status || e.statusCode || 500, // <- status instead of code
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
```

Request `/` and `/error`:

```js
GET / -> 200

{
  status: 200,
  data: { username: 'username', gender: 'male' }
}
```

```js
GET /error -> 200

{
  status: 500,
  message: 'hi is not defined'
}
```

### ctx.\_raw

To return raw JSON, you must add `ctx._raw` before returning the response.

```js
import { Hono } from 'hono'
import json from 'hono-json'
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

```

Request `/` and `/_raw`:

```js
GET / -> 200

{
  status: 200,
  data: { username: 'username', gender: 'male' }
}
```

```js
GET /_raw -> 200

{
  username: 'username',
  gender: 'male'
}
```

### Test(100% coverage rate)

```sh
$ npm test
```

### License

MIT
