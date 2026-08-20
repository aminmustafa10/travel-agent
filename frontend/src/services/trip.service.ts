import type { CreateTripInput, Trip } from '../types/trip'
import { apiRequest } from './api'

export function listTrips(): Promise<Trip[]> {
  return apiRequest<Trip[]>('/trips', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    fallbackErrorMessage: 'Não foi possível carregar suas viagens.',
  })
}
export function createTrip(input: CreateTripInput): Promise<Trip> {
  return apiRequest<Trip>('/trips', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
    fallbackErrorMessage: 'Não foi possível criar a viagem.',
  })
}
