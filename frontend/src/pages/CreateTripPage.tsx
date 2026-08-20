import { useState, type FormEvent } from 'react'
import { ApiError } from '../services/api'
import { createTrip } from '../services/trip.service'
import type { CreateTripInput } from '../types/trip'
import { parseBudgetToCents } from '../utils/formatters'

type CreateTripPageProps = {
  onCancel: () => void
  onCreated: (tripId: string) => void
}

type TripFormValues = {
  name: string
  destinationCity: string
  destinationCountry: string
  startDate: string
  endDate: string
  currency: string
  weeklyBudget: string
}

type FormErrors = Partial<Record<keyof TripFormValues, string>>

const initialValues: TripFormValues = {
  name: '',
  destinationCity: '',
  destinationCountry: '',
  startDate: '',
  endDate: '',
  currency: '',
  weeklyBudget: '',
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

function validateForm(values: TripFormValues): {
  errors: FormErrors
  input?: CreateTripInput
} {
  const errors: FormErrors = {}
  const name = values.name.trim()
  const destinationCity = values.destinationCity.trim()
  const destinationCountry = values.destinationCountry.trim()
  const currency = values.currency.trim().toUpperCase()
  const weeklyBudgetCents = parseBudgetToCents(values.weeklyBudget)

  if (name.length < 2) errors.name = 'Informe um nome com pelo menos 2 caracteres.'
  if (destinationCity.length < 2) {
    errors.destinationCity = 'Informe uma cidade com pelo menos 2 caracteres.'
  }
  if (destinationCountry.length < 2) {
    errors.destinationCountry = 'Informe um país com pelo menos 2 caracteres.'
  }
  if (!isValidDate(values.startDate)) {
    errors.startDate = 'Informe uma data inicial válida.'
  }
  if (!isValidDate(values.endDate)) {
    errors.endDate = 'Informe uma data final válida.'
  } else if (isValidDate(values.startDate) && values.endDate <= values.startDate) {
    errors.endDate = 'A data final deve ser posterior à data inicial.'
  }
  if (!/^[A-Z]{3}$/.test(currency)) {
    errors.currency = 'Use exatamente 3 letras, como BRL ou EUR.'
  }
  if (weeklyBudgetCents === undefined) {
    errors.weeklyBudget = 'Informe um valor positivo, como 250,00.'
  }

  if (Object.keys(errors).length > 0 || weeklyBudgetCents === undefined) {
    return { errors }
  }

  return {
    errors,
    input: {
      name,
      destinationCity,
      destinationCountry,
      startDate: values.startDate,
      endDate: values.endDate,
      currency,
      weeklyBudgetCents,
    },
  }
}

export function CreateTripPage({
  onCancel,
  onCreated,
}: CreateTripPageProps) {
  const [values, setValues] = useState<TripFormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(field: keyof TripFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
    if (submitError) setSubmitError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validation = validateForm(values)

    if (!validation.input) {
      setErrors(validation.errors)
      return
    }

    setErrors({})
    setSubmitError('')
    setIsSubmitting(true)

    try {
      const trip = await createTrip(validation.input)
      onCreated(trip.id)
    } catch (error: unknown) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : 'Ocorreu um erro inesperado ao criar a viagem.',
      )
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flow-page flow-page--narrow" id="top">
      <button className="back-button" type="button" onClick={onCancel}>
        <span aria-hidden="true">←</span>
        Suas viagens
      </button>

      <section className="create-trip-header" aria-labelledby="create-trip-title">
        <p className="eyebrow">Novo planejamento</p>
        <h1 id="create-trip-title">Crie sua próxima viagem</h1>
        <p>
          Preencha os dados básicos para começar a acompanhar seu orçamento
          semanal.
        </p>
      </section>

      <form className="trip-form" onSubmit={handleSubmit} noValidate>
        <div className="form-section">
          <div className="form-section__heading">
            <span>01</span>
            <div>
              <h2>Destino</h2>
              <p>Como você quer identificar esta viagem?</p>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-field form-field--wide">
              <label htmlFor="trip-name">Nome da viagem</label>
              <input
                id="trip-name"
                value={values.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Ex.: Intercâmbio Dublin"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'trip-name-error' : undefined}
              />
              {errors.name && <p id="trip-name-error">{errors.name}</p>}
            </div>
            <div className="form-field">
              <label htmlFor="destination-city">Cidade</label>
              <input
                id="destination-city"
                value={values.destinationCity}
                onChange={(event) =>
                  updateField('destinationCity', event.target.value)
                }
                placeholder="Dublin"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.destinationCity)}
                aria-describedby={
                  errors.destinationCity ? 'destination-city-error' : undefined
                }
              />
              {errors.destinationCity && (
                <p id="destination-city-error">{errors.destinationCity}</p>
              )}
            </div>
            <div className="form-field">
              <label htmlFor="destination-country">País</label>
              <input
                id="destination-country"
                value={values.destinationCountry}
                onChange={(event) =>
                  updateField('destinationCountry', event.target.value)
                }
                placeholder="Irlanda"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.destinationCountry)}
                aria-describedby={
                  errors.destinationCountry
                    ? 'destination-country-error'
                    : undefined
                }
              />
              {errors.destinationCountry && (
                <p id="destination-country-error">
                  {errors.destinationCountry}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section__heading">
            <span>02</span>
            <div>
              <h2>Período</h2>
              <p>Defina quando a viagem começa e termina.</p>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="start-date">Data de início</label>
              <input
                id="start-date"
                type="date"
                value={values.startDate}
                onChange={(event) =>
                  updateField('startDate', event.target.value)
                }
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.startDate)}
                aria-describedby={
                  errors.startDate ? 'start-date-error' : undefined
                }
              />
              {errors.startDate && (
                <p id="start-date-error">{errors.startDate}</p>
              )}
            </div>
            <div className="form-field">
              <label htmlFor="end-date">Data de término</label>
              <input
                id="end-date"
                type="date"
                min={values.startDate || undefined}
                value={values.endDate}
                onChange={(event) =>
                  updateField('endDate', event.target.value)
                }
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.endDate)}
                aria-describedby={errors.endDate ? 'end-date-error' : undefined}
              />
              {errors.endDate && <p id="end-date-error">{errors.endDate}</p>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section__heading">
            <span>03</span>
            <div>
              <h2>Orçamento</h2>
              <p>Informe a moeda e o limite planejado para cada semana.</p>
            </div>
          </div>
          <div className="form-grid form-grid--budget">
            <div className="form-field">
              <label htmlFor="currency">Moeda</label>
              <input
                id="currency"
                value={values.currency}
                onChange={(event) =>
                  updateField(
                    'currency',
                    event.target.value.toUpperCase().slice(0, 3),
                  )
                }
                placeholder="EUR"
                maxLength={3}
                autoComplete="off"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.currency)}
                aria-describedby={errors.currency ? 'currency-error' : undefined}
              />
              {errors.currency && <p id="currency-error">{errors.currency}</p>}
            </div>
            <div className="form-field form-field--budget">
              <label htmlFor="weekly-budget">Orçamento semanal</label>
              <div className="budget-input">
                <span aria-hidden="true">{values.currency || '¤'}</span>
                <input
                  id="weekly-budget"
                  inputMode="decimal"
                  value={values.weeklyBudget}
                  onChange={(event) =>
                    updateField('weeklyBudget', event.target.value)
                  }
                  placeholder="250,00"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.weeklyBudget)}
                  aria-describedby={
                    errors.weeklyBudget
                      ? 'weekly-budget-error'
                      : 'weekly-budget-hint'
                  }
                />
              </div>
              <span className="form-field__hint" id="weekly-budget-hint">
                Use vírgula para os centavos.
              </span>
              {errors.weeklyBudget && (
                <p id="weekly-budget-error">{errors.weeklyBudget}</p>
              )}
            </div>
          </div>
        </div>

        {submitError && (
          <div className="form-submit-error" role="alert">
            <strong>Não foi possível criar a viagem.</strong>
            <p>{submitError}</p>
          </div>
        )}

        <div className="form-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Criando viagem...' : 'Criar viagem'}
          </button>
        </div>
      </form>
    </main>
  )
}
