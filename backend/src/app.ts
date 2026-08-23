import express from 'express'
import { copilotRoutes } from './modules/copilot/copilot.routes.js'
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
app.use('/copilot', copilotRoutes)

app.use(errorHandler)
