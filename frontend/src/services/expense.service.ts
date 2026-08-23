import type { CreateExpenseInput, Expense } from '../types/expense'
import { ApiError, apiRequest } from './api'

function getExpensesPath(tripId: string): string {
  const normalizedTripId = tripId.trim()

  if (!normalizedTripId) {
    throw new ApiError('A viagem é obrigatória.', 400)
  }

  return `/trips/${encodeURIComponent(normalizedTripId)}/expenses`
}

export function listExpenses(tripId: string): Promise<Expense[]> {
  return apiRequest<Expense[]>(getExpensesPath(tripId), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    fallbackErrorMessage: 'Não foi possível carregar as despesas.',
  })
}

export function createExpense(
  tripId: string,
  input: CreateExpenseInput,
): Promise<Expense> {
  return apiRequest<Expense>(getExpensesPath(tripId), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
    fallbackErrorMessage: 'Não foi possível registrar a despesa.',
  })
}

export function deleteExpense(
  tripId: string,
  expenseId: string,
): Promise<void> {
  const normalizedExpenseId = expenseId.trim()

  if (!normalizedExpenseId) {
    throw new ApiError('A despesa é obrigatória.', 400)
  }

  return apiRequest<void>(
    `${getExpensesPath(tripId)}/${encodeURIComponent(normalizedExpenseId)}`,
    {
      method: 'DELETE',
      fallbackErrorMessage: 'Não foi possível excluir a despesa.',
    },
  )
}
