import { Router } from 'express'
import { expenseRoutes } from '../expenses/expense.routes.js'
import {
  createTripController,
  getTripByIdController,
  listTripsController,
} from './trip.controller.js'

export const tripRoutes = Router()

tripRoutes.post('/', createTripController)
tripRoutes.get('/', listTripsController)
tripRoutes.use('/:tripId/expenses', expenseRoutes)
tripRoutes.get('/:id', getTripByIdController)
