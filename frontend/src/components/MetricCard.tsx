type MetricCardProps = {
  label: string
  value: string
  description?: string
  tone?: 'default' | 'positive' | 'warning' | 'critical'
}

export function MetricCard({
  label,
  value,
  description,
  tone = 'default',
}: MetricCardProps) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <p className="metric-card__label">{label}</p>
      <strong className="metric-card__value">{value}</strong>
      {description && (
        <p className="metric-card__description">{description}</p>
      )}
    </article>
  )
}

