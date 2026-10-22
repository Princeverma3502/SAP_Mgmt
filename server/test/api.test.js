import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { app } from '../src/app.js'
import { ticketQuerySchema } from '../src/ai/schemas.js'

let server
let baseUrl

before(async () => {
  server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve())
  })
})

test('health check reports the API as available', async () => {
  const response = await fetch(`${baseUrl}/api/health`)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    status: 'ok',
    service: 'eam-ticketing-api',
  })
})

test('AI triage rejects invalid ticket input before calling the model', async () => {
  const response = await fetch(`${baseUrl}/api/ai/triage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'bad', description: 'short' }),
  })
  assert.equal(response.status, 400)
  assert.equal((await response.json()).error, 'Invalid request.')
})

test('AI triage reports missing OpenAI configuration explicitly', async () => {
  const previousKey = process.env.OPENAI_API_KEY
  delete process.env.OPENAI_API_KEY
  try {
    const response = await fetch(`${baseUrl}/api/ai/triage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: 'Goods receipt blocked in MIGO',
        description: 'The posting period is closed for company code 1000.',
      }),
    })
    assert.equal(response.status, 503)
    assert.match((await response.json()).error, /OPENAI_API_KEY/)
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY
    else process.env.OPENAI_API_KEY = previousKey
  }
})

test('ticket filters reject unsupported enum values', () => {
  assert.equal(ticketQuerySchema.safeParse({ status: 'ESCALATED' }).success, false)
})

test('ticket routes report a missing database configuration explicitly', async () => {
  const previousUrl = process.env.DATABASE_URL
  delete process.env.DATABASE_URL
  try {
    const response = await fetch(`${baseUrl}/api/tickets`)
    assert.equal(response.status, 503)
    assert.match((await response.json()).error, /DATABASE_URL/)
  } finally {
    if (previousUrl === undefined) delete process.env.DATABASE_URL
    else process.env.DATABASE_URL = previousUrl
  }
})

test('unknown API routes return a JSON 404', async () => {
  const response = await fetch(`${baseUrl}/api/missing`)
  assert.equal(response.status, 404)
  assert.deepEqual(await response.json(), { error: 'Route not found.' })
})

test('malformed JSON returns a client error response', async () => {
  const response = await fetch(`${baseUrl}/api/ai/triage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{',
  })
  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'Request body must contain valid JSON.' })
})
