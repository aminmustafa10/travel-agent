import express from 'express'
import { tripRoutes } from './modules/trips/trip.routes.js'
import { errorHandler } from './shared/middlewares/error-handler.js'

export const app = express()

app.use(express.json())

app.get('/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'travel-agent-api',
  })
})

app.use('/trips', tripRoutes)

app.use(errorHandler)
