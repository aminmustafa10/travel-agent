import type { Request, Response } from 'express'
import { getSpendingAlerts } from './spending-alerts.service.js'

type SpendingAlertsParams = {
  tripId: string
}

export async function getSpendingAlertsController(
  request: Request<SpendingAlertsParams>,
  response: Response,
): Promise<void> {
  const spendingAlerts = await getSpendingAlerts(request.params.tripId)

  response.status(200).json(spendingAlerts)
}

