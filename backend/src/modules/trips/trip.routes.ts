import { Router } from 'express'
import { expenseRoutes } from '../expenses/expense.routes.js'
import { spendingAlertsRoutes } from '../spending-alerts/spending-alerts.routes.js'
import { spendingPaceRoutes } from '../spending-pace/spending-pace.routes.js'
import {
  createTripController,
  getTripByIdController,
  listTripsController,
} from './trip.controller.js'

export const tripRoutes = Router()

tripRoutes.post('/', createTripController)
tripRoutes.get('/', listTripsController)
tripRoutes.use('/:tripId/alerts', spendingAlertsRoutes)
tripRoutes.use('/:tripId/expenses', expenseRoutes)
tripRoutes.use('/:tripId/spending-pace', spendingPaceRoutes)
tripRoutes.get('/:id', getTripByIdController)
