import { useState, type FormEvent } from 'react'
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  type CreateExpenseInput,
  type ExpenseCategory,
} from '../types/expense'
import { parseBudgetToCents } from '../utils/formatters'

interface ExpenseFormProps {
  currency: string
  onCancel: () => void
  onSubmit: (input: CreateExpenseInput) => Promise<void>
}

interface ExpenseFormValues {
  description: string
  amount: string
  category: ExpenseCategory
  expenseDate: string
}

const INITIAL_VALUES: ExpenseFormValues = {
  description: '',
  amount: '',
  category: 'FOOD',
  expenseDate: '',
}

function isRealDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return false
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

function validate(values: ExpenseFormValues): string | null {
  if (values.description.trim().length < 2) {
    return 'Informe uma descrição com pelo menos 2 caracteres.'
  }

  if (parseBudgetToCents(values.amount) === undefined) {
    return 'Informe um valor válido e maior que zero.'
  }

  if (!isRealDate(values.expenseDate)) {
    return 'Informe uma data válida para a despesa.'
  }

  return null
}

export function ExpenseForm({
  currency,
  onCancel,
  onSubmit,
}: ExpenseFormProps) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const validationError = validate(values)

    if (validationError) {
      setError(validationError)
      return
    }

    const amountCents = parseBudgetToCents(values.amount)

    if (amountCents === undefined) {
      setError('Informe um valor válido e maior que zero.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit({
        description: values.description.trim(),
        amountCents,
        category: values.category,
        expenseDate: values.expenseDate,
      })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível registrar a despesa.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit} noValidate>
      <div className="expense-form__heading">
        <div>
          <p className="eyebrow">Novo registro</p>
          <h3>Adicionar despesa</h3>
        </div>
        <p>Os valores serão registrados em {currency}.</p>
      </div>

      <div className="expense-form__grid">
        <div className="form-field expense-form__description">
          <label htmlFor="expense-description">Descrição</label>
          <input
            id="expense-description"
            name="description"
            type="text"
            minLength={2}
            placeholder="Ex.: Almoço"
            value={values.description}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="expense-amount">Valor ({currency})</label>
          <input
            id="expense-amount"
            name="amount"
            type="text"
            inputMode="decimal"
            placeholder="18,50"
            value={values.amount}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                amount: event.target.value,
              }))
            }
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="expense-category">Categoria</label>
          <select
            id="expense-category"
            name="category"
            value={values.category}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                category: event.target.value as ExpenseCategory,
              }))
            }
            disabled={isSubmitting}
          >
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {EXPENSE_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="expense-date">Data da despesa</label>
          <input
            id="expense-date"
            name="expenseDate"
            type="date"
            value={values.expenseDate}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                expenseDate: event.target.value,
              }))
            }
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="form-actions">
        <button
          className="secondary-button"
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          className="primary-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registrando...' : 'Registrar despesa'}
        </button>
      </div>
    </form>
  )
}
