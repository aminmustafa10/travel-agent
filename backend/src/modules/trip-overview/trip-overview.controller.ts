import type { Request, Response } from 'express'
import { getTripOverview } from './trip-overview.service.js'

type TripOverviewParams = {
  tripId: string
}

export async function getTripOverviewController(
  request: Request<TripOverviewParams>,
  response: Response,
): Promise<void> {
  const overview = await getTripOverview(request.params.tripId)

  response.status(200).json(overview)
}

