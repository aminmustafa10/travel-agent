import type { Request, Response } from 'express'
import { createTripSchema } from './trip.schema.js'
import { createTrip, findTripById, listTrips } from './trip.service.js'

export async function createTripController(
  request: Request,
  response: Response,
): Promise<void> {
  const data = createTripSchema.parse(request.body)
  const trip = await createTrip(data)

  response.status(201).json(trip)
}

export async function listTripsController(
  _request: Request,
  response: Response,
): Promise<void> {
  const trips = await listTrips()

  response.status(200).json(trips)
}

export async function getTripByIdController(
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> {
  const trip = await findTripById(request.params.id)

  response.status(200).json(trip)
}
