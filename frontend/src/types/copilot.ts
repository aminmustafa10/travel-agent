export type CopilotView = 'trips' | 'create-trip' | 'trip-overview'

export type CopilotContext = {
  tripId?: string
  view?: CopilotView
}

export type CopilotRole = 'user' | 'assistant'

export type CopilotMessage = {
  id: string
  role: CopilotRole
  content: string
  isError?: boolean
}

export type CopilotChatRequest = {
  message: string
  context?: CopilotContext
}

export type CopilotChatResponse = {
  message: string
  mode: 'foundation'
  context: CopilotContext
}
