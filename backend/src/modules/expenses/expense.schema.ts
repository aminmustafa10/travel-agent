import { z } from 'zod'

const expenseCategories = [
  'ACCOMMODATION',
  'FOOD',
  'TRANSPORT',
  'LEISURE',
  'SHOPPING',
  'HEALTH',
  'EDUCATION',
  'OTHER',
] as const

const datePattern = /^\d{4}-\d{2}-\d{2}$/

function isValidDate(value: string): boolean {
  if (!datePattern.test(value)) {
    return false
  }

  const date = new Date(`${value}T00:00:00.000Z`)

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString() === `${value}T00:00:00.000Z`
  )
}

function toUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`)
}

const expenseDateSchema = z
  .string()
  .regex(datePattern, 'A data deve estar no formato YYYY-MM-DD.')
  .refine(isValidDate, 'A data informada não existe.')
  .transform(toUtcDate)

export const createExpenseSchema = z.strictObject({
  description: z
    .string()
    .trim()
    .min(2, 'A descrição deve ter pelo menos 2 caracteres.'),
  amountCents: z
    .number()
    .int('O valor deve ser um número inteiro.')
    .positive('O valor deve ser positivo.'),
  category: z.enum(expenseCategories, {
    error: 'A categoria informada é inválida.',
  }),
  expenseDate: expenseDateSchema,
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>

