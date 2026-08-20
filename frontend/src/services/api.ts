const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? '/api'
).replace(/\/$/, '')

type BackendErrorPayload = {
  error?: {
    message?: unknown
  }
}
export class ApiError extends Error {
  readonly statusCode?: number

  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = 'ApiError'
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

type ApiRequestOptions = RequestInit & {
  fallbackErrorMessage: string
}

export async function apiRequest<T>(
  path: string,
  { fallbackErrorMessage, ...requestInit }: ApiRequestOptions,
): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${apiBaseUrl}${path}`, requestInit)
  } catch {
    throw new ApiError(
      'Não foi possível conectar à API. Verifique se o backend está disponível.',
    )
  }

  const payload = await readResponsePayload(response)

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(payload) ?? fallbackErrorMessage,
      response.status,
    )
  }

  return payload as T
}
