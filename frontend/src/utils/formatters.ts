const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  const utcDate = new Date(Date.UTC(year, month - 1, day))

  return dateFormatter.format(utcDate)
}

export function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

export function parseBudgetToCents(value: string): number | undefined {
  const normalized = value.trim().replace(/\s/g, '')

  if (!/^(?:\d{1,3}(?:\.\d{3})*|\d+)(?:,\d{1,2})?$/.test(normalized)) {
    return undefined
  }

  const [wholePart, decimalPart = ''] = normalized.split(',')
  const wholeCents = Number(wholePart.replace(/\./g, '')) * 100
  const fractionCents = Number(decimalPart.padEnd(2, '0'))
  const totalCents = wholeCents + fractionCents

  return Number.isSafeInteger(totalCents) && totalCents > 0
    ? totalCents
    : undefined
}
