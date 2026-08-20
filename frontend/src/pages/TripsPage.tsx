import { useEffect, useState } from 'react'
import { TripCard } from '../components/TripCard'
import { ApiError } from '../services/api'
import { listTrips } from '../services/trip.service'
import type { Trip } from '../types/trip'

type TripsPageProps = {
  onCreateTrip: () => void
  onSelectTrip: (tripId: string) => void
}
type TripsState =
  | { status: 'loading' }
  | { status: 'success'; trips: Trip[] }
  | { status: 'error'; message: string }

export function TripsPage({
  onCreateTrip,
  onSelectTrip,
}: TripsPageProps) {
  const [reloadKey, setReloadKey] = useState(0)
  const [state, setState] = useState<TripsState>({ status: 'loading' })

  useEffect(() => {
    let isCurrent = true

    async function loadTrips() {
      setState({ status: 'loading' })

      try {
        const trips = await listTrips()
        if (isCurrent) setState({ status: 'success', trips })
      } catch (error: unknown) {
        if (!isCurrent) return

        setState({
          status: 'error',
          message:
            error instanceof ApiError
              ? error.message
              : 'Ocorreu um erro inesperado ao carregar suas viagens.',
        })
      }
    }

    void loadTrips()

    return () => {
      isCurrent = false
    }
  }, [reloadKey])

  return (
    <main className="flow-page" id="top">
      <section className="flow-heading" aria-labelledby="trips-title">
        <div>
          <p className="eyebrow">Planejamento em um só lugar</p>
          <h1 id="trips-title">Suas viagens</h1>
          <p>
            Organize seus planos e acompanhe orçamento, gastos e alertas em um
            só lugar.
          </p>
        </div>
        <button className="primary-button" type="button" onClick={onCreateTrip}>
          <span aria-hidden="true">+</span>
          Nova viagem
        </button>
      </section>

      <div aria-live="polite">
        {state.status === 'loading' && (
          <section className="loading-state" role="status">
            <span className="loading-state__spinner" aria-hidden="true" />
            <div>
              <h2>Carregando suas viagens</h2>
              <p>Estamos buscando seus planos mais recentes.</p>
            </div>
          </section>
        )}

        {state.status === 'error' && (
          <section className="error-state" role="alert">
            <span className="error-state__code" aria-hidden="true">
              !
            </span>
            <div>
              <h2>Não foi possível carregar suas viagens</h2>
              <p>{state.message}</p>
              <button
                className="secondary-button secondary-button--compact"
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                Tentar novamente
              </button>
            </div>
          </section>
        )}

        {state.status === 'success' && state.trips.length === 0 && (
          <section className="empty-state empty-state--trips">
            <span className="empty-state__symbol" aria-hidden="true">
              ↗
            </span>
            <div>
              <h2>Nenhuma viagem por aqui ainda.</h2>
              <p>
                Crie sua primeira viagem para começar a acompanhar orçamento e
                gastos.
              </p>
              <button
                className="primary-button primary-button--compact"
                type="button"
                onClick={onCreateTrip}
              >
                Criar minha primeira viagem
              </button>
            </div>
          </section>
        )}

        {state.status === 'success' && state.trips.length > 0 && (
          <section className="trips-grid" aria-label="Lista de viagens">
            {state.trips.map((trip) => (
              <TripCard trip={trip} onSelect={onSelectTrip} key={trip.id} />
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
