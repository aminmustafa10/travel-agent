import type { Request, Response } from 'express'
import { createExpenseSchema } from './expense.schema.js'
import {
  createExpense,
  deleteExpense,
  listExpenses,
} from './expense.service.js'

type TripParams = {
  tripId: string
}

type ExpenseParams = TripParams & {
  expenseId: string
}

export async function createExpenseController(
  request: Request<TripParams>,
  response: Response,
): Promise<void> {
  const data = createExpenseSchema.parse(request.body)
  const expense = await createExpense(request.params.tripId, data)

  response.status(201).json(expense)
}

export async function listExpensesController(
  request: Request<TripParams>,
  response: Response,
): Promise<void> {
  const expenses = await listExpenses(request.params.tripId)

  response.status(200).json(expenses)
}

export async function deleteExpenseController(
  request: Request<ExpenseParams>,
  response: Response,
): Promise<void> {
  await deleteExpense(request.params.tripId, request.params.expenseId)

  response.status(204).send()
}

