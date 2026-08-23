import type { Request, Response } from 'express'
import { copilotChatSchema } from './copilot.schema.js'
import { chatWithCopilot } from './copilot.service.js'

export function chatWithCopilotController(
  request: Request,
  response: Response,
): void {
  const input = copilotChatSchema.parse(request.body)
  const result = chatWithCopilot(input)

  response.status(200).json(result)
}
