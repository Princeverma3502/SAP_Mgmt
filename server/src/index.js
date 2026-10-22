import 'dotenv/config'
import { app } from './app.js'
import { prisma } from './lib/prisma.js'

const port = Number(process.env.PORT || 4000)
const server = app.listen(port, () => {
  console.log(`EAM ticketing API listening on http://localhost:${port}`)
})

async function shutdown(signal) {
  console.log(`${signal} received; shutting down API.`)
  server.close(async (error) => {
    if (error) {
      console.error('API shutdown failed:', error)
      process.exitCode = 1
    }
    await prisma.$disconnect()
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
