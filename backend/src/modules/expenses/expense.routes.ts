import { Router } from 'express'
import {
  createExpenseController,
  deleteExpenseController,
  listExpensesController,
} from './expense.controller.js'

export const expenseRoutes = Router({ mergeParams: true })

expenseRoutes.post('/', createExpenseController)
expenseRoutes.get('/', listExpensesController)
expenseRoutes.delete('/:expenseId', deleteExpenseController)

