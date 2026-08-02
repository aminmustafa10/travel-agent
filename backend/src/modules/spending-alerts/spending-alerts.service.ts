import { getSpendingPace } from '../spending-pace/spending-pace.service.js'

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL'
export type AlertType = 'SPENDING_PACE'

type SpendingPaceResult = Awaited<ReturnType<typeof getSpendingPace>>
type SpendingPaceStatus = SpendingPaceResult['status']

type SpendingAlertMetrics = {
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

type SpendingAlert = {
  type: AlertType
  severity: AlertSeverity
  status: SpendingPaceStatus
  title: string
  message: string
  recommendation: string
  metrics: SpendingAlertMetrics
}

export type SpendingAlertsResponse = {
  tripId: string
  generatedAt: string
  hasCriticalAlert: boolean
  alerts: [SpendingAlert]
}

const severityByStatus: Record<SpendingPaceStatus, AlertSeverity> = {
  NOT_STARTED: 'INFO',
  ON_TRACK: 'INFO',
  WARNING: 'WARNING',
  OVER_BUDGET: 'CRITICAL',
  FINISHED: 'INFO',
}

const alertContentByStatus: Record<
  SpendingPaceStatus,
  { title: string; message: string }
> = {
  NOT_STARTED: {
    title: 'Viagem ainda não iniciada',
    message: 'A viagem ainda não começou.',
  },
  ON_TRACK: {
    title: 'Gastos dentro do planejado',
    message: 'Seus gastos estão dentro do ritmo planejado.',
  },
  WARNING: {
    title: 'Ritmo de gastos elevado',
    message: 'Você está gastando mais rápido que o planejado.',
  },
  OVER_BUDGET: {
    title: 'Orçamento semanal atingido',
    message: 'O orçamento semanal foi atingido ou ultrapassado.',
  },
  FINISHED: {
    title: 'Viagem finalizada',
    message: 'A viagem foi finalizada.',
  },
}

function calculateAverageDailySpendCents(
  spentCents: number,
  elapsedDays: number,
): number {
  return elapsedDays > 0
    ? Math.round(Math.max(spentCents, 0) / elapsedDays)
    : 0
}

function calculateRecommendedDailyLimitCents(
  remainingBudgetCents: number,
  remainingDays: number,
): number {
  return remainingDays > 0
    ? Math.max(Math.floor(Math.max(remainingBudgetCents, 0) / remainingDays), 0)
    : 0
}

function calculateProjectedOverageCents(
  projectedWeekSpendCents: number,
  weeklyBudgetCents: number,
): number {
  return Math.max(projectedWeekSpendCents - weeklyBudgetCents, 0)
}

function buildRecommendation(
  status: SpendingPaceStatus,
  remainingDays: number,
  recommendedDailyLimitCents: number,
  requiredReductionCents: number,
): string {
  switch (status) {
    case 'NOT_STARTED':
      return 'O acompanhamento do ritmo de gastos começará na data inicial da viagem.'
    case 'ON_TRACK':
      return remainingDays > 0
        ? `Você pode gastar em média até ${recommendedDailyLimitCents} centavos por dia nos próximos ${remainingDays} dias.`
        : 'O período semanal atual foi concluído dentro do orçamento.'
    case 'WARNING':
      return `Reduza a projeção de gastos em ${requiredReductionCents} centavos. O limite médio recomendado é de ${recommendedDailyLimitCents} centavos por dia nos próximos ${remainingDays} dias.`
    case 'OVER_BUDGET':
      return remainingDays > 0
        ? `Evite novos gastos não essenciais durante os próximos ${remainingDays} dias.`
        : 'Revise os gastos desta semana antes de iniciar o próximo período.'
    case 'FINISHED':
      return 'Consulte o histórico de despesas para revisar o resultado financeiro da viagem.'
  }
}

function buildMetrics(pace: SpendingPaceResult): SpendingAlertMetrics {
  const averageDailySpendCents = calculateAverageDailySpendCents(
    pace.spentCents,
    pace.elapsedDays,
  )
  const recommendedDailyLimitCents = calculateRecommendedDailyLimitCents(
    pace.remainingBudgetCents,
    pace.remainingDays,
  )
  const projectedOverageCents = calculateProjectedOverageCents(
    pace.projectedWeekSpendCents,
    pace.weeklyBudgetCents,
  )

  return {
    weekNumber: pace.weekNumber,
    periodStart: pace.periodStart,
    periodEnd: pace.periodEnd,
    elapsedDays: pace.elapsedDays,
    remainingDays: pace.remainingDays,
    weeklyBudgetCents: pace.weeklyBudgetCents,
    spentCents: pace.spentCents,
    remainingBudgetCents: pace.remainingBudgetCents,
    budgetUsedPercentage: pace.budgetUsedPercentage,
    timeElapsedPercentage: pace.timeElapsedPercentage,
    expectedSpentCents: pace.expectedSpentCents,
    projectedWeekSpendCents: pace.projectedWeekSpendCents,
    averageDailySpendCents,
    recommendedDailyLimitCents,
    projectedOverageCents,
    requiredReductionCents: projectedOverageCents,
  }
}

export async function getSpendingAlerts(
  tripId: string,
): Promise<SpendingAlertsResponse> {
  const pace = await getSpendingPace(tripId)
  const severity = severityByStatus[pace.status]
  const content = alertContentByStatus[pace.status]
  const metrics = buildMetrics(pace)
  const alert: SpendingAlert = {
    type: 'SPENDING_PACE',
    severity,
    status: pace.status,
    title: content.title,
    message: content.message,
    recommendation: buildRecommendation(
      pace.status,
      pace.remainingDays,
      metrics.recommendedDailyLimitCents,
      metrics.requiredReductionCents,
    ),
    metrics,
  }

  return {
    tripId: pace.tripId,
    generatedAt: new Date().toISOString(),
    hasCriticalAlert: severity === 'CRITICAL',
    alerts: [alert],
  }
}

