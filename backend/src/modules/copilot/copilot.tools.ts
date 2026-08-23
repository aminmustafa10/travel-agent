import type { CopilotToolDefinition } from './copilot.types.js'

export const copilotTools = [
  {
    name: 'LIST_TRIPS',
    description: 'Lista as viagens existentes.',
    kind: 'read',
  },
  {
    name: 'GET_TRIP_OVERVIEW',
    description: 'Consulta a visão geral, o ritmo de gastos e os alertas de uma viagem.',
    kind: 'read',
  },
  {
    name: 'CREATE_TRIP',
    description: 'Cria uma nova viagem com período e orçamento semanal.',
    kind: 'write',
  },
  {
    name: 'LIST_EXPENSES',
    description: 'Lista as despesas vinculadas a uma viagem.',
    kind: 'read',
  },
  {
    name: 'CREATE_EXPENSE',
    description: 'Registra uma nova despesa em uma viagem.',
    kind: 'write',
  },
  {
    name: 'DELETE_EXPENSE',
    description: 'Exclui uma despesa vinculada a uma viagem.',
    kind: 'write',
  },
] as const satisfies readonly CopilotToolDefinition[]
