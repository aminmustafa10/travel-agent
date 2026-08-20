export type SpendingPaceStatus =
  | 'NOT_STARTED'
  | 'ON_TRACK'
  | 'WARNING'
  | 'OVER_BUDGET'
  | 'FINISHED'

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL'

export type TripSummary = {
  id: string
  name: string
  destinationCity: string
  destinationCountry: string
  startDate: string
  endDate: string
  currency: string
  weeklyBudgetCents: number
}

export type SpendingPace = {
  tripId: string
  status: SpendingPaceStatus
  weekNumber: number
  periodStart: string
  periodEnd: string
  daysInPeriod: number
  elapsedDays: number
  remainingDays: number
  weeklyBudgetCents: number
  spentCents: number
  remainingBudgetCents: number
  budgetUsedPercentage: number
  timeElapsedPercentage: number
  expectedSpentCents: number
  projectedWeekSpendCents: number
  message: string
}

export type SpendingAlertMetrics = {
  weekNumber: number
  periodStart: string
  periodEnd: string
  elapsedDays: number
  remainingDays: number
  weeklyBudgetCents: number
  spentCents: number
  remainingBudgetCents: number
  budgetUsedPercentage: number
  timeElapsedPercentage: number
  expectedSpentCents: number
  projectedWeekSpendCents: number
  averageDailySpendCents: number
  recommendedDailyLimitCents: number
  projectedOverageCents: number
  requiredReductionCents: number
}

export type SpendingAlert = {
  type: 'SPENDING_PACE'
  severity: AlertSeverity
  status: SpendingPaceStatus
  title: string
  message: string
  recommendation: string
  metrics: SpendingAlertMetrics
}

export type SpendingAlerts = {
  tripId: string
  generatedAt: string
  hasCriticalAlert: boolean
  alerts: SpendingAlert[]
}

export type TripOverview = {
  tripId: string
  generatedAt: string
  trip: TripSummary
  spendingPace: SpendingPace
  alerts: SpendingAlerts
}

