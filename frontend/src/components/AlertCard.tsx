import type { SpendingAlert } from '../types/trip-overview'
import { StatusBadge } from './StatusBadge'

type AlertCardProps = {
  alert: SpendingAlert
}

export function AlertCard({ alert }: AlertCardProps) {
  return (
    <article
      className={`alert-card alert-card--${alert.severity.toLowerCase()}`}
    >
      <div className="alert-card__header">
        <div>
          <p className="alert-card__eyebrow">Alerta preventivo</p>
          <h3>{alert.title}</h3>
        </div>
        <StatusBadge kind="severity" value={alert.severity} />
      </div>
      <p className="alert-card__message">{alert.message}</p>
      <div className="alert-card__recommendation">
        <strong>Recomendação</strong>
        <p>{alert.recommendation}</p>
      </div>
    </article>
  )
}

