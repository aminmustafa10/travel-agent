import { useState } from 'react'
import './App.css'
import { CreateTripPage } from './pages/CreateTripPage'
import { TripOverviewPage } from './pages/TripOverviewPage'
import { TripsPage } from './pages/TripsPage'

type AppView = 'trips' | 'create-trip' | 'overview'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('trips')
  const [selectedTripId, setSelectedTripId] = useState<string>()

  function showTrips() {
    setSelectedTripId(undefined)
    setCurrentView('trips')
  }

  function showOverview(tripId: string) {
    setSelectedTripId(tripId)
    setCurrentView('overview')
  }

  const viewLabel =
    currentView === 'trips'
      ? 'Suas viagens'
      : currentView === 'create-trip'
        ? 'Nova viagem'
        : 'Visão geral da viagem'

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="brand"
          type="button"
          onClick={showTrips}
          aria-label="Travel Agent — suas viagens"
        >
          <span className="brand__mark" aria-hidden="true">
            TA
          </span>
          <span>Travel Agent</span>
        </button>
        <span className="topbar__tagline">{viewLabel}</span>
      </header>

      {currentView === 'trips' && (
        <TripsPage
          onCreateTrip={() => setCurrentView('create-trip')}
          onSelectTrip={showOverview}
        />
      )}

      {currentView === 'create-trip' && (
        <CreateTripPage onCancel={showTrips} onCreated={showOverview} />
      )}

      {currentView === 'overview' && selectedTripId && (
        <TripOverviewPage tripId={selectedTripId} onBack={showTrips} />
      )}
    </div>
  )
}

export default App
