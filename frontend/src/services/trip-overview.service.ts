import type { TripOverview } from '../types/trip-overview'

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? '/api'
).replace(/\/$/, '')

type BackendErrorPayload = {
  error?: {
    message?: unknown
  }
}

export class TripOverviewServiceError extends Error {
  readonly statusCode?: number

  constructor(
    message: string,
    statusCode?: number,
  ) {
    super(message)
    this.name = 'TripOverviewServiceError'
    this.statusCode = statusCode
  }
}

function extractErrorMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined
  }

  const errorPayload = payload as BackendErrorPayload
  const message = errorPayload.error?.message

  return typeof message === 'string' && message.trim() ? message : undefined
}

async function readResponsePayload(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return undefined
  }
}

export async function getTripOverview(tripId: string): Promise<TripOverview> {
  const normalizedTripId = tripId.trim()

  if (!normalizedTripId) {
    throw new TripOverviewServiceError('Informe um Trip ID para continuar.')
  }

  let response: Response

  try {
    response = await fetch(
      `${apiBaseUrl}/trips/${encodeURIComponent(normalizedTripId)}/overview`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    )
  } catch {
    throw new TripOverviewServiceError(
      'Não foi possível conectar à API. Verifique se o backend está disponível.',
    )
  }

  const payload = await readResponsePayload(response)

  if (!response.ok) {
    const backendMessage = extractErrorMessage(payload)

    if (response.status === 404) {
      throw new TripOverviewServiceError(
        backendMessage ?? 'Viagem não encontrada.',
        404,
      )
    }

    throw new TripOverviewServiceError(
      backendMessage ?? 'Não foi possível carregar os dados da viagem.',
      response.status,
    )
  }

  return payload as TripOverview
}
