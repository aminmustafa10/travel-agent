import type { TripOverview } from '../types/trip-overview'
import { ApiError, apiRequest } from './api'

export { ApiError as TripOverviewServiceError }

export async function getTripOverview(tripId: string): Promise<TripOverview> {
  const normalizedTripId = tripId.trim()

  if (!normalizedTripId) {
    throw new ApiError('Não foi possível identificar a viagem selecionada.')
  }

  return apiRequest<TripOverview>(
    `/trips/${encodeURIComponent(normalizedTripId)}/overview`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      fallbackErrorMessage: 'Não foi possível carregar os dados da viagem.',
    },
  )
}
