import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../shared/errors/app-error.js'

const millisecondsPerDay = 24 * 60 * 60 * 1000

type SpendingPaceStatus =
  | 'NOT_STARTED'
  | 'ON_TRACK'
  | 'WARNING'
  | 'OVER_BUDGET'
  | 'FINISHED'

type TripPhase = 'NOT_STARTED' | 'ACTIVE' | 'FINISHED'

type TripForSpendingPace = {
  id: string
  startDate: Date
  endDate: Date
  weeklyBudgetCents: number
}

type WeeklyPeriod = {
  phase: TripPhase
  weekNumber: number
  periodStart: Date
  periodEnd: Date
  periodEndExclusive: Date
  daysInPeriod: number
  elapsedDays: number
  remainingDays: number
}

const statusMessages: Record<SpendingPaceStatus, string> = {
  NOT_STARTED: 'A viagem ainda não começou.',
  ON_TRACK: 'Seus gastos estão dentro do ritmo planejado.',
  WARNING: 'Você está gastando mais rápido que o planejado.',
  OVER_BUDGET: 'O orçamento semanal foi atingido ou ultrapassado.',
  FINISHED: 'A viagem foi finalizada.',
}

function startOfUtcDay(value: Date): Date {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  )
}

function addUtcDays(value: Date, days: number): Date {
  return new Date(value.getTime() + days * millisecondsPerDay)
}

function differenceInUtcDays(later: Date, earlier: Date): number {
  return Math.floor((later.getTime() - earlier.getTime()) / millisecondsPerDay)
}

function earlierDate(first: Date, second: Date): Date {
  return first < second ? first : second
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}

function calculateWeeklyPeriod(
  trip: TripForSpendingPace,
  referenceDate: Date,
): WeeklyPeriod {
  const today = startOfUtcDay(referenceDate)
  const tripStart = startOfUtcDay(trip.startDate)
  const tripEnd = startOfUtcDay(trip.endDate)
  const phase: TripPhase =
    today < tripStart
      ? 'NOT_STARTED'
      : today > tripEnd
        ? 'FINISHED'
        : 'ACTIVE'

  const periodReference = phase === 'FINISHED' ? tripEnd : today
  const elapsedTripDays = Math.max(
    differenceInUtcDays(periodReference, tripStart),
    0,
  )
  const weekNumber = Math.floor(elapsedTripDays / 7) + 1
  const periodStart = addUtcDays(tripStart, (weekNumber - 1) * 7)
  const periodEnd = earlierDate(addUtcDays(periodStart, 6), tripEnd)
  const daysInPeriod = differenceInUtcDays(periodEnd, periodStart) + 1
  const elapsedDays =
    phase === 'NOT_STARTED'
      ? 0
      : phase === 'FINISHED'
        ? daysInPeriod
        : clamp(
            differenceInUtcDays(today, periodStart) + 1,
            0,
            daysInPeriod,
          )

  return {
    phase,
    weekNumber,
    periodStart,
    periodEnd,
    periodEndExclusive: addUtcDays(periodEnd, 1),
    daysInPeriod,
    elapsedDays,
    remainingDays: Math.max(daysInPeriod - elapsedDays, 0),
  }
}

function roundPercentage(value: number): number {
  return Math.round(value * 100) / 100
}

function calculatePercentage(value: number, total: number): number {
  return total > 0 ? roundPercentage((value / total) * 100) : 0
}

function calculateExpectedSpentCents(
  weeklyBudgetCents: number,
  elapsedDays: number,
  daysInPeriod: number,
): number {
  return daysInPeriod > 0
    ? Math.round((weeklyBudgetCents * elapsedDays) / daysInPeriod)
    : 0
}

function calculateProjectedWeekSpendCents(
  spentCents: number,
  elapsedDays: number,
  daysInPeriod: number,
): number {
  return elapsedDays > 0
    ? Math.round((spentCents / elapsedDays) * daysInPeriod)
    : 0
}

function determineStatus(
  phase: TripPhase,
  spentCents: number,
  weeklyBudgetCents: number,
  projectedWeekSpendCents: number,
): SpendingPaceStatus {
  if (phase === 'NOT_STARTED') {
    return 'NOT_STARTED'
  }

  if (phase === 'FINISHED') {
    return 'FINISHED'
  }

  if (spentCents >= weeklyBudgetCents) {
    return 'OVER_BUDGET'
  }

  if (projectedWeekSpendCents > weeklyBudgetCents) {
    return 'WARNING'
  }

  return 'ON_TRACK'
}

function formatUtcDate(value: Date): string {
  return value.toISOString().slice(0, 10)
}

export async function getSpendingPace(tripId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      weeklyBudgetCents: true,
    },
  })

  if (!trip) {
    throw new AppError(404, 'TRIP_NOT_FOUND', 'Viagem não encontrada.')
  }

  const period = calculateWeeklyPeriod(trip, new Date())
  const expenseAggregate = await prisma.expense.aggregate({
    where: {
      tripId: trip.id,
      expenseDate: {
        gte: period.periodStart,
        lt: period.periodEndExclusive,
      },
    },
    _sum: {
      amountCents: true,
    },
  })
  const spentCents = expenseAggregate._sum.amountCents ?? 0
  const remainingBudgetCents = Math.max(
    trip.weeklyBudgetCents - spentCents,
    0,
  )
  const budgetUsedPercentage = calculatePercentage(
    spentCents,
    trip.weeklyBudgetCents,
  )
  const timeElapsedPercentage = calculatePercentage(
    period.elapsedDays,
    period.daysInPeriod,
  )
  const expectedSpentCents = calculateExpectedSpentCents(
    trip.weeklyBudgetCents,
    period.elapsedDays,
    period.daysInPeriod,
  )
  const projectedWeekSpendCents = calculateProjectedWeekSpendCents(
    spentCents,
    period.elapsedDays,
    period.daysInPeriod,
  )
  const status = determineStatus(
    period.phase,
    spentCents,
    trip.weeklyBudgetCents,
    projectedWeekSpendCents,
  )

  return {
    tripId: trip.id,
    status,
    weekNumber: period.weekNumber,
    periodStart: formatUtcDate(period.periodStart),
    periodEnd: formatUtcDate(period.periodEnd),
    daysInPeriod: period.daysInPeriod,
    elapsedDays: period.elapsedDays,
    remainingDays: period.remainingDays,
    weeklyBudgetCents: trip.weeklyBudgetCents,
    spentCents,
    remainingBudgetCents,
    budgetUsedPercentage,
    timeElapsedPercentage,
    expectedSpentCents,
    projectedWeekSpendCents,
    message: statusMessages[status],
  }
}

