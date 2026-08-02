import { Router } from 'express'
import { getSpendingAlertsController } from './spending-alerts.controller.js'

export const spendingAlertsRoutes = Router({ mergeParams: true })

spendingAlertsRoutes.get('/', getSpendingAlertsController)

