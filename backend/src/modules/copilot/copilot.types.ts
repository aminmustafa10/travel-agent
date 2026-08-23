export const COPILOT_VIEWS = [
  'trips',
  'create-trip',
  'trip-overview',
] as const

export type CopilotView = (typeof COPILOT_VIEWS)[number]

export type CopilotContext = {
  tripId?: string
  view?: CopilotView
}

export type CopilotChatInput = {
  message: string
  context?: CopilotContext
}

export type CopilotChatResponse = {
  message: string
  mode: 'foundation'
  context: CopilotContext
}

export type CopilotToolKind = 'read' | 'write'

export type CopilotToolName =
  | 'LIST_TRIPS'
  | 'GET_TRIP_OVERVIEW'
  | 'CREATE_TRIP'
  | 'LIST_EXPENSES'
  | 'CREATE_EXPENSE'
  | 'DELETE_EXPENSE'

export type CopilotToolDefinition = {
  name: CopilotToolName
  description: string
  kind: CopilotToolKind
}
