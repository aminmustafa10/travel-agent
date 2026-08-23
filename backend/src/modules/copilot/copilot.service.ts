import type {
  CopilotChatInput,
  CopilotChatResponse,
} from './copilot.types.js'

const foundationMessage =
  'O AI Copilot está preparado para receber esta mensagem, mas o modelo de IA ainda não foi conectado.'

export function chatWithCopilot(
  input: CopilotChatInput,
): CopilotChatResponse {
  return {
    message: foundationMessage,
    mode: 'foundation',
    context: input.context ?? {},
  }
}
