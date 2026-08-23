import { z } from 'zod'
import { COPILOT_VIEWS } from './copilot.types.js'

const copilotContextSchema = z.strictObject({
  tripId: z
    .string()
    .trim()
    .min(1, 'O identificador da viagem não pode estar vazio.')
    .max(128, 'O identificador da viagem é muito longo.')
    .optional(),
  view: z.enum(COPILOT_VIEWS).optional(),
})

export const copilotChatSchema = z.strictObject({
  message: z
    .string()
    .trim()
    .min(1, 'A mensagem não pode estar vazia.')
    .max(2000, 'A mensagem deve ter no máximo 2000 caracteres.'),
  context: copilotContextSchema.optional(),
})
