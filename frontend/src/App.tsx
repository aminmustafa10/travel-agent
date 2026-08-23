import { useState } from 'react'
import './App.css'
import { CopilotButton } from './components/copilot/CopilotButton'
import { CopilotPanel } from './components/copilot/CopilotPanel'
import { CreateTripPage } from './pages/CreateTripPage'
import { TripOverviewPage } from './pages/TripOverviewPage'
import { TripsPage } from './pages/TripsPage'
import type { CopilotContext } from './types/copilot'

type AppView = 'trips' | 'create-trip' | 'overview'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('trips')
  const [selectedTripId, setSelectedTripId] = useState<string>()
  const [isCopilotOpen, setIsCopilotOpen] = useState(false)

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
  const copilotContext: CopilotContext =
    currentView === 'overview'
      ? {
          view: 'trip-overview',
          ...(selectedTripId ? { tripId: selectedTripId } : {}),
        }
      : { view: currentView }

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

      {!isCopilotOpen ? (
        <CopilotButton onOpen={() => setIsCopilotOpen(true)} />
      ) : null}
      <CopilotPanel
        context={copilotContext}
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  )
}

export default App
