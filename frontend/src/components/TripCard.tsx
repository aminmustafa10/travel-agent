import type { Trip } from '../types/trip'
import { formatDate, formatMoney } from '../utils/formatters'

type TripCardProps = {
  trip: Trip
  onSelect: (tripId: string) => void
}
export function TripCard({ trip, onSelect }: TripCardProps) {
  return (
    <article className="trip-card">
      <div className="trip-card__topline">
        <span>{trip.currency}</span>
        <span>
          {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
        </span>
      </div>
      <div className="trip-card__content">
        <h2>{trip.name}</h2>
        <p>
          {trip.destinationCity}, {trip.destinationCountry}
        </p>
      </div>
      <div className="trip-card__budget">
        <span>Orçamento semanal</span>
        <strong>{formatMoney(trip.weeklyBudgetCents, trip.currency)}</strong>
      </div>
      <button type="button" onClick={() => onSelect(trip.id)}>
        Ver viagem
        <span aria-hidden="true">→</span>
      </button>
    </article>
  )
}
