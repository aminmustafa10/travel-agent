import { Router } from 'express'
import { chatWithCopilotController } from './copilot.controller.js'

export const copilotRoutes = Router()

copilotRoutes.post('/chat', chatWithCopilotController)
