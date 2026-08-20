import { useEffect, useState } from 'react'
import { AlertCard } from '../components/AlertCard'
import { MetricCard } from '../components/MetricCard'
import { StatusBadge } from '../components/StatusBadge'
import {
  getTripOverview,
  TripOverviewServiceError,
} from '../services/trip-overview.service'
import type {
  SpendingPaceStatus,
  TripOverview,
} from '../types/trip-overview'
import { formatDate, formatMoney } from '../utils/formatters'

type TripOverviewPageProps = {
  tripId: string
  onBack: () => void
}

type ViewState =
  | { status: 'loading' }
  | { status: 'success'; data: TripOverview }
  | { status: 'error'; message: string; notFound: boolean }

const percentageFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
})

function getMetricTone(
  status: SpendingPaceStatus,
): 'default' | 'positive' | 'warning' | 'critical' {
  if (status === 'OVER_BUDGET') return 'critical'
  if (status === 'WARNING') return 'warning'
  if (status === 'ON_TRACK') return 'positive'
  return 'default'
}

export function TripOverviewPage({
  tripId,
  onBack,
}: TripOverviewPageProps) {
  const [reloadKey, setReloadKey] = useState(0)
  const [viewState, setViewState] = useState<ViewState>({ status: 'loading' })

  useEffect(() => {
    let isCurrent = true

    async function loadOverview() {
      setViewState({ status: 'loading' })

      try {
        const data = await getTripOverview(tripId)
        if (isCurrent) setViewState({ status: 'success', data })
      } catch (error: unknown) {
        if (!isCurrent) return

        setViewState({
          status: 'error',
          message:
            error instanceof TripOverviewServiceError
              ? error.message
              : 'Ocorreu um erro inesperado ao carregar a viagem.',
          notFound:
            error instanceof TripOverviewServiceError &&
            error.statusCode === 404,
        })
      }
    }

    void loadOverview()

    return () => {
      isCurrent = false
    }
  }, [tripId, reloadKey])

  const overview = viewState.status === 'success' ? viewState.data : undefined
  const currency = overview?.trip.currency ?? 'BRL'
  const pace = overview?.spendingPace
  const alertMetrics = overview?.alerts.alerts[0]?.metrics
  const progressValue = Math.min(
    Math.max(pace?.budgetUsedPercentage ?? 0, 0),
    100,
  )

  return (
    <main className="overview-page" id="top">
      <button className="back-button" type="button" onClick={onBack}>
        <span aria-hidden="true">←</span>
        Suas viagens
      </button>

      <div className="view-state" aria-live="polite">
        {viewState.status === 'loading' && (
          <section className="loading-state" role="status">
            <span className="loading-state__spinner" aria-hidden="true" />
            <div>
              <h1>Carregando visão geral</h1>
              <p>Estamos organizando os dados mais recentes da viagem.</p>
            </div>
          </section>
        )}

        {viewState.status === 'error' && (
          <section className="error-state" role="alert">
            <span className="error-state__code" aria-hidden="true">
              {viewState.notFound ? '404' : '!'}
            </span>
            <div>
              <h1>
                {viewState.notFound
                  ? 'Viagem não encontrada'
                  : 'Não foi possível carregar a viagem'}
              </h1>
              <p>{viewState.message}</p>
              <div className="error-state__actions">
                <button
                  className="secondary-button secondary-button--compact"
                  type="button"
                  onClick={() => setReloadKey((key) => key + 1)}
                >
                  Tentar novamente
                </button>
                <button
                  className="text-button"
                  type="button"
                  onClick={onBack}
                >
                  Voltar para suas viagens
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {overview && pace && (
        <div className="dashboard">
          <section className="trip-header" aria-labelledby="trip-name">
            <div>
              <p className="eyebrow">Viagem em acompanhamento</p>
              <h1 id="trip-name">{overview.trip.name}</h1>
              <p className="trip-header__destination">
                {overview.trip.destinationCity},{' '}
                {overview.trip.destinationCountry}
              </p>
            </div>
            <div className="trip-header__details">
              <div>
                <span>Período</span>
                <strong>
                  {formatDate(overview.trip.startDate)} —{' '}
                  {formatDate(overview.trip.endDate)}
                </strong>
              </div>
              <div>
                <span>Moeda</span>
                <strong>{overview.trip.currency}</strong>
              </div>
            </div>
          </section>

          <section className="dashboard-section" aria-labelledby="summary-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Resumo financeiro</p>
                <h2 id="summary-title">Sua semana em números</h2>
              </div>
              <span className="section-heading__period">
                Semana {pace.weekNumber} · {formatDate(pace.periodStart)} a{' '}
                {formatDate(pace.periodEnd)}
              </span>
            </div>
            <div className="metric-grid metric-grid--summary">
              <MetricCard
                label="Orçamento semanal"
                value={formatMoney(pace.weeklyBudgetCents, currency)}
                description="Limite definido para o período"
              />
              <MetricCard
                label="Gasto atual"
                value={formatMoney(pace.spentCents, currency)}
                description={`${percentageFormatter.format(pace.budgetUsedPercentage)}% do orçamento`}
                tone={getMetricTone(pace.status)}
              />
              <MetricCard
                label="Saldo restante"
                value={formatMoney(pace.remainingBudgetCents, currency)}
                description="Disponível até o fim da semana"
                tone={pace.remainingBudgetCents > 0 ? 'positive' : 'critical'}
              />
              <MetricCard
                label="Projeção da semana"
                value={formatMoney(pace.projectedWeekSpendCents, currency)}
                description="Mantendo o ritmo atual"
                tone={getMetricTone(pace.status)}
              />
            </div>
          </section>

          <section className="pace-panel" aria-labelledby="pace-title">
            <div className="pace-panel__summary">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="eyebrow">Ritmo de gastos</p>
                  <h2 id="pace-title">Acompanhamento atual</h2>
                </div>
                <StatusBadge kind="status" value={pace.status} />
              </div>
              <p className="pace-panel__message">{pace.message}</p>

              <div className="progress-block">
                <div className="progress-block__header">
                  <span>Orçamento utilizado</span>
                  <strong>
                    {percentageFormatter.format(pace.budgetUsedPercentage)}%
                  </strong>
                </div>
                <div
                  className="progress-track"
                  role="progressbar"
                  aria-label="Percentual do orçamento semanal utilizado"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressValue}
                  aria-valuetext={`${percentageFormatter.format(pace.budgetUsedPercentage)}% do orçamento utilizado`}
                >
                  <span
                    className={`progress-track__fill progress-track__fill--${getMetricTone(pace.status)}`}
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
                <p>
                  A barra é limitada a 100%. O percentual real permanece
                  indicado acima.
                </p>
              </div>
            </div>

            <dl className="pace-facts">
              <div>
                <dt>Semana atual</dt>
                <dd>{pace.weekNumber}</dd>
              </div>
              <div>
                <dt>Dias decorridos</dt>
                <dd>{pace.elapsedDays}</dd>
              </div>
              <div>
                <dt>Dias restantes</dt>
                <dd>{pace.remainingDays}</dd>
              </div>
              <div>
                <dt>Período decorrido</dt>
                <dd>{percentageFormatter.format(pace.timeElapsedPercentage)}%</dd>
              </div>
            </dl>
          </section>

          <section className="dashboard-section" aria-labelledby="alerts-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Alertas</p>
                <h2 id="alerts-title">Orientações preventivas</h2>
              </div>
              {overview.alerts.hasCriticalAlert && (
                <span className="critical-indicator">Ação recomendada</span>
              )}
            </div>
            <div className="alerts-list">
              {overview.alerts.alerts.map((alert, index) => (
                <AlertCard
                  alert={alert}
                  key={`${alert.type}-${alert.status}-${index}`}
                />
              ))}
            </div>
          </section>

          {alertMetrics && (
            <section
              className="dashboard-section"
              aria-labelledby="additional-metrics-title"
            >
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Métricas adicionais</p>
                  <h2 id="additional-metrics-title">
                    Detalhes para sua decisão
                  </h2>
                </div>
              </div>
              <div className="metric-grid metric-grid--details">
                <MetricCard
                  label="Gasto médio diário"
                  value={formatMoney(
                    alertMetrics.averageDailySpendCents,
                    currency,
                  )}
                />
                <MetricCard
                  label="Limite diário recomendado"
                  value={formatMoney(
                    alertMetrics.recommendedDailyLimitCents,
                    currency,
                  )}
                  tone="positive"
                />
                <MetricCard
                  label="Gasto esperado até agora"
                  value={formatMoney(
                    alertMetrics.expectedSpentCents,
                    currency,
                  )}
                />
                <MetricCard
                  label="Projeção semanal"
                  value={formatMoney(
                    alertMetrics.projectedWeekSpendCents,
                    currency,
                  )}
                  tone={getMetricTone(pace.status)}
                />
                <MetricCard
                  label="Excesso projetado"
                  value={formatMoney(
                    alertMetrics.projectedOverageCents,
                    currency,
                  )}
                  tone={
                    alertMetrics.projectedOverageCents > 0
                      ? 'warning'
                      : 'positive'
                  }
                />
                <MetricCard
                  label="Redução necessária"
                  value={formatMoney(
                    alertMetrics.requiredReductionCents,
                    currency,
                  )}
                  tone={
                    alertMetrics.requiredReductionCents > 0
                      ? 'critical'
                      : 'positive'
                  }
                />
              </div>
            </section>
          )}

          <footer className="dashboard-footer">
            Atualizado em {formatDate(overview.generatedAt)}
          </footer>
        </div>
      )}
    </main>
  )
}

