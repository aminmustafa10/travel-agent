import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../shared/errors/app-error.js'
import type { CreateExpenseInput } from './expense.schema.js'

async function ensureTripExists(tripId: string): Promise<void> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { id: true },
  })

  if (!trip) {
    throw new AppError(404, 'TRIP_NOT_FOUND', 'Viagem não encontrada.')
  }
}

export async function createExpense(
  tripId: string,
  data: CreateExpenseInput,
) {
  await ensureTripExists(tripId)

  return prisma.expense.create({
    data: {
      ...data,
      tripId,
    },
  })
}

export async function listExpenses(tripId: string) {
  await ensureTripExists(tripId)

  return prisma.expense.findMany({
    where: { tripId },
    orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
  })
}

export async function deleteExpense(
  tripId: string,
  expenseId: string,
): Promise<void> {
  const result = await prisma.expense.deleteMany({
    where: {
      id: expenseId,
      tripId,
    },
  })

  if (result.count === 0) {
    throw new AppError(404, 'EXPENSE_NOT_FOUND', 'Despesa não encontrada.')
  }
}

