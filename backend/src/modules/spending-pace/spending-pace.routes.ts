import { Router } from 'express'
import { getSpendingPaceController } from './spending-pace.controller.js'

export const spendingPaceRoutes = Router({ mergeParams: true })

spendingPaceRoutes.get('/', getSpendingPaceController)

