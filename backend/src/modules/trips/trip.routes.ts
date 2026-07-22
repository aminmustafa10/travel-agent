import { Router } from 'express'
import {
  createTripController,
  getTripByIdController,
  listTripsController,
} from './trip.controller.js'

export const tripRoutes = Router()

tripRoutes.post('/', createTripController)
tripRoutes.get('/', listTripsController)
tripRoutes.get('/:id', getTripByIdController)

