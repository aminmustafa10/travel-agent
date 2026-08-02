import type { Request, Response } from 'express'
import { getSpendingPace } from './spending-pace.service.js'

type SpendingPaceParams = {
  tripId: string
}

export async function getSpendingPaceController(
  request: Request<SpendingPaceParams>,
  response: Response,
): Promise<void> {
  const spendingPace = await getSpendingPace(request.params.tripId)

  response.status(200).json(spendingPace)
}

