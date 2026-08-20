import type {
  AlertSeverity,
  SpendingPaceStatus,
} from '../types/trip-overview'

type StatusBadgeProps =
  | { kind: 'status'; value: SpendingPaceStatus }
  | { kind: 'severity'; value: AlertSeverity }

const statusLabels: Record<SpendingPaceStatus, string> = {
  NOT_STARTED: 'Não iniciada',
  ON_TRACK: 'Dentro do ritmo',
  WARNING: 'Atenção',
  OVER_BUDGET: 'Orçamento atingido',
  FINISHED: 'Finalizada',
}

const severityLabels: Record<AlertSeverity, string> = {
  INFO: 'Informativo',
  WARNING: 'Atenção',
  CRITICAL: 'Crítico',
}

export function StatusBadge(props: StatusBadgeProps) {
  const label =
    props.kind === 'status'
      ? statusLabels[props.value]
      : severityLabels[props.value]

  return (
    <span
      className={`status-badge status-badge--${props.value.toLowerCase().replace('_', '-')}`}
    >
      <span className="status-badge__marker" aria-hidden="true" />
      {label}
    </span>
  )
}

