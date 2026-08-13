import { Router } from 'express'
import { getTripOverviewController } from './trip-overview.controller.js'

export const tripOverviewRoutes = Router({ mergeParams: true })

tripOverviewRoutes.get('/', getTripOverviewController)

