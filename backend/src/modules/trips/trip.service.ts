import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../shared/errors/app-error.js'
import type { CreateTripInput } from './trip.schema.js'

export function createTrip(data: CreateTripInput) {
  return prisma.trip.create({ data })
}

export function listTrips() {
  return prisma.trip.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function findTripById(id: string) {
  const trip = await prisma.trip.findUnique({
    where: { id },
  })

  if (!trip) {
    throw new AppError(404, 'TRIP_NOT_FOUND', 'Viagem não encontrada.')
  }

  return trip
}

