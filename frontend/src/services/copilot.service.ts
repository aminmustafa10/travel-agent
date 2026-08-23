import type {
  CopilotChatRequest,
  CopilotChatResponse,
  CopilotContext,
  CopilotView,
} from '../types/copilot'
import { ApiError, apiRequest } from './api'

const copilotViews: readonly CopilotView[] = [
  'trips',
  'create-trip',
  'trip-overview',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isCopilotView(value: unknown): value is CopilotView {
  return typeof value === 'string' && copilotViews.includes(value as CopilotView)
}

function isCopilotContext(value: unknown): value is CopilotContext {
  if (!isRecord(value)) {
    return false
  }

  const { tripId, view } = value

  return (
    (tripId === undefined ||
      (typeof tripId === 'string' && tripId.trim().length > 0)) &&
    (view === undefined || isCopilotView(view))
  )
}

function isCopilotChatResponse(value: unknown): value is CopilotChatResponse {
  return (
    isRecord(value) &&
    typeof value.message === 'string' &&
    value.message.trim().length > 0 &&
    value.mode === 'foundation' &&
    isCopilotContext(value.context)
  )
}

export async function sendCopilotMessage(
  input: CopilotChatRequest,
): Promise<CopilotChatResponse> {
  const message = input.message.trim()

  if (!message) {
    throw new ApiError('Escreva uma mensagem antes de enviar.', 400)
  }

  const response = await apiRequest<unknown>('/copilot/chat', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      context: input.context,
    }),
    fallbackErrorMessage: 'Não foi possível falar com o assistente.',
  })

  if (!isCopilotChatResponse(response)) {
    throw new ApiError('O assistente retornou uma resposta inválida.')
  }

  return response
}
