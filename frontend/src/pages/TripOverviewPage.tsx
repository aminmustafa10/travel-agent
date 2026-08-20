import { useState, type FormEvent } from 'react'
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

type ViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: TripOverview }
  | { status: 'error'; message: string; notFound: boolean }

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const percentageFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
})

function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  const utcDate = new Date(Date.UTC(year, month - 1, day))

  return dateFormatter.format(utcDate)
}

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

function getMetricTone(
  status: SpendingPaceStatus,
): 'default' | 'positive' | 'warning' | 'critical' {
  if (status === 'OVER_BUDGET') return 'critical'
  if (status === 'WARNING') return 'warning'
  if (status === 'ON_TRACK') return 'positive'
  return 'default'
}

export function TripOverviewPage() {
  const [tripId, setTripId] = useState('')
  const [formError, setFormError] = useState('')
  const [viewState, setViewState] = useState<ViewState>({ status: 'idle' })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedTripId = tripId.trim()

    if (!normalizedTripId) {
      setFormError('Informe um Trip ID para carregar a viagem.')
      return
    }

    setFormError('')
    setViewState({ status: 'loading' })

    try {
      const data = await getTripOverview(normalizedTripId)
      setViewState({ status: 'success', data })
    } catch (error: unknown) {
      if (error instanceof TripOverviewServiceError) {
        setViewState({
          status: 'error',
          message: error.message,
          notFound: error.statusCode === 404,
        })
        return
      }

      setViewState({
        status: 'error',
        message: 'Ocorreu um erro inesperado ao carregar a viagem.',
        notFound: false,
      })
    }
  }

  const overview = viewState.status === 'success' ? viewState.data : undefined
  const currency = overview?.trip.currency ?? 'BRL'
  const pace = overview?.spendingPace
  const alertMetrics = overview?.alerts.alerts[0]?.metrics
  const progressValue = Math.min(
    Math.max(pace?.budgetUsedPercentage ?? 0, 0),
    100,
  )

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Travel Agent — início">
          <span className="brand__mark" aria-hidden="true">
            TA
          </span>
          <span>Travel Agent</span>
        </a>
        <span className="topbar__tagline">Visão geral da viagem</span>
      </header>

      <main className="overview-page" id="top">
        <section className="hero-section" aria-labelledby="page-title">
          <div className="hero-section__copy">
            <p className="eyebrow">Seu painel preventivo</p>
            <h1 id="page-title">Travel Agent</h1>
            <p>
              Monitore sua viagem, orçamento e ritmo de gastos em um só lugar.
            </p>
          </div>

          <form className="trip-search" onSubmit={handleSubmit} noValidate>
            <label htmlFor="trip-id">Trip ID</label>
            <div className="trip-search__controls">
              <input
                id="trip-id"
                name="tripId"
                type="text"
                value={tripId}
                onChange={(event) => {
                  setTripId(event.target.value)
                  if (formError) setFormError('')
                }}
                placeholder="Ex.: cm123abc..."
                autoComplete="off"
                aria-describedby={formError ? 'trip-id-error' : undefined}
                aria-invalid={Boolean(formError)}
                disabled={viewState.status === 'loading'}
              />
              <button type="submit" disabled={viewState.status === 'loading'}>
                {viewState.status === 'loading'
                  ? 'Carregando...'
                  : 'Carregar viagem'}
              </button>
            </div>
            {formError && (
              <p className="field-error" id="trip-id-error" role="alert">
                {formError}
              </p>
            )}
          </form>
        </section>

        <div className="view-state" aria-live="polite">
          {viewState.status === 'idle' && (
            <section className="empty-state">
              <span className="empty-state__symbol" aria-hidden="true">
                ↗
              </span>
              <div>
                <h2>Pronto para acompanhar sua viagem</h2>
                <p>
                  Informe o identificador acima para visualizar orçamento,
                  projeções e alertas preventivos.
                </p>
              </div>
            </section>
          )}

          {viewState.status === 'loading' && (
            <section className="loading-state" role="status">
              <span className="loading-state__spinner" aria-hidden="true" />
              <div>
                <h2>Carregando visão geral</h2>
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
                <h2>
                  {viewState.notFound
                    ? 'Viagem não encontrada'
                    : 'Não foi possível carregar a viagem'}
                </h2>
                <p>{viewState.message}</p>
                <p className="error-state__hint">
                  {viewState.notFound
                    ? 'Confira o Trip ID informado e tente novamente.'
                    : 'Verifique a conexão com a API e faça uma nova tentativa.'}
                </p>
              </div>
            </section>
          )}
        </div>

        {overview && pace && (
          <div className="dashboard">
            <section className="trip-header" aria-labelledby="trip-name">
              <div>
                <p className="eyebrow">Viagem em acompanhamento</p>
                <h2 id="trip-name">{overview.trip.name}</h2>
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
                  <dd>
                    {percentageFormatter.format(pace.timeElapsedPercentage)}%
                  </dd>
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
    </div>
  )
}

