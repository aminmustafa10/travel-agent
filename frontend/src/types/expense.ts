export const EXPENSE_CATEGORIES = [
  'ACCOMMODATION',
  'FOOD',
  'TRANSPORT',
  'LEISURE',
  'SHOPPING',
  'HEALTH',
  'EDUCATION',
  'OTHER',
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  ACCOMMODATION: 'Hospedagem',
  FOOD: 'Alimentação',
  TRANSPORT: 'Transporte',
  LEISURE: 'Lazer',
  SHOPPING: 'Compras',
  HEALTH: 'Saúde',
  EDUCATION: 'Educação',
  OTHER: 'Outros',
}

export interface Expense {
  id: string
  tripId: string
  description: string
  amountCents: number
  category: ExpenseCategory
  expenseDate: string
  createdAt: string
  updatedAt: string
}

export interface CreateExpenseInput {
  description: string
  amountCents: number
  category: ExpenseCategory
  expenseDate: string
}
