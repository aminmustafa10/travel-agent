import { prisma } from '../../lib/prisma.js'
import { getSpendingAlerts } from '../spending-alerts/spending-alerts.service.js'
import { getSpendingPace } from '../spending-pace/spending-pace.service.js'
import { AppError } from '../../shared/errors/app-error.js'

type SpendingPaceResult = Awaited<ReturnType<typeof getSpendingPace>>
type SpendingAlertsResult = Awaited<ReturnType<typeof getSpendingAlerts>>

type TripOverviewResponse = {
  tripId: string
  generatedAt: string
  trip: {
    id: string
    name: string
    destinationCity: string
    destinationCountry: string
    startDate: Date
    endDate: Date
    currency: string
    weeklyBudgetCents: number
  }
  spendingPace: SpendingPaceResult
  alerts: SpendingAlertsResult
}

export async function getTripOverview(
  tripId: string,
): Promise<TripOverviewResponse> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      id: true,
      name: true,
      destinationCity: true,
      destinationCountry: true,
      startDate: true,
      endDate: true,
      currency: true,
      weeklyBudgetCents: true,
    },
  })

  if (!trip) {
    throw new AppError(404, 'TRIP_NOT_FOUND', 'Viagem não encontrada.')
  }

  const [spendingPace, alerts] = await Promise.all([
    getSpendingPace(tripId),
    getSpendingAlerts(tripId),
  ])

  return {
    tripId: trip.id,
    generatedAt: new Date().toISOString(),
    trip,
    spendingPace,
    alerts,
  }
}

