import { z } from 'zod'

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

const dateSchema = z
  .string()
  .regex(datePattern, 'A data deve estar no formato YYYY-MM-DD.')
  .refine(isValidDate, 'A data informada não existe.')
  .transform(toUtcDate)

export const createTripSchema = z
  .strictObject({
    name: z.string().trim().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
    destinationCity: z
      .string()
      .trim()
      .min(2, 'A cidade de destino deve ter pelo menos 2 caracteres.'),
    destinationCountry: z
      .string()
      .trim()
      .min(2, 'O país de destino deve ter pelo menos 2 caracteres.'),
    startDate: dateSchema,
    endDate: dateSchema,
    currency: z
      .string()
      .regex(/^[A-Za-z]{3}$/, 'A moeda deve conter exatamente 3 letras.')
      .transform((value) => value.toUpperCase()),
    weeklyBudgetCents: z
      .number()
      .int('O orçamento semanal deve ser um número inteiro.')
      .positive('O orçamento semanal deve ser positivo.'),
  })
  .refine((data) => data.endDate > data.startDate, {
    path: ['endDate'],
    message: 'A data final deve ser posterior à data inicial.',
  })

export type CreateTripInput = z.infer<typeof createTripSchema>

