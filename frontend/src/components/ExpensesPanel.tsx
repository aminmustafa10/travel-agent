import { useEffect, useState } from 'react'
import {
  createExpense,
  deleteExpense,
  listExpenses,
} from '../services/expense.service'
import type { CreateExpenseInput, Expense } from '../types/expense'
import { ExpenseForm } from './ExpenseForm'
import { ExpenseList } from './ExpenseList'

interface ExpensesPanelProps {
  tripId: string
  currency: string
  onExpensesChanged: () => void
}

type ExpensesState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; expenses: Expense[] }

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function ExpensesPanel({
  tripId,
  currency,
  onExpensesChanged,
}: ExpensesPanelProps) {
  const [state, setState] = useState<ExpensesState>({ status: 'loading' })
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadExpenses() {
      setState({ status: 'loading' })

      try {
        const expenses = await listExpenses(tripId)

        if (isActive) {
          setState({ status: 'success', expenses })
        }
      } catch (error) {
        if (isActive) {
          setState({
            status: 'error',
            message: getErrorMessage(error, 'Não foi possível carregar as despesas.'),
          })
        }
      }
    }

    void loadExpenses()

    return () => {
      isActive = false
    }
  }, [tripId, reloadKey])

  async function refreshExpenses() {
    try {
      const expenses = await listExpenses(tripId)
      setState({ status: 'success', expenses })
    } catch (error) {
      setState({
        status: 'error',
        message: getErrorMessage(error, 'Não foi possível atualizar as despesas.'),
      })
    }
  }

  async function handleCreate(input: CreateExpenseInput) {
    await createExpense(tripId, input)
    setIsFormOpen(false)
    setMutationError(null)
    await refreshExpenses()
    onExpensesChanged()
  }

  async function handleDelete(expense: Expense) {
    const shouldDelete = window.confirm(
      `Excluir a despesa “${expense.description}”? Esta ação não pode ser desfeita.`,
    )

    if (!shouldDelete) {
      return
    }

    setDeletingExpenseId(expense.id)
    setMutationError(null)

    try {
      await deleteExpense(tripId, expense.id)
      await refreshExpenses()
      onExpensesChanged()
    } catch (error) {
      setMutationError(
        getErrorMessage(error, 'Não foi possível excluir a despesa.'),
      )
    } finally {
      setDeletingExpenseId(null)
    }
  }

  return (
    <section className="dashboard-section expenses-section" aria-labelledby="expenses-title">
      <div className="section-heading section-heading--with-action">
        <div>
          <p className="eyebrow">Histórico da viagem</p>
          <h2 id="expenses-title">Despesas recentes</h2>
        </div>

        {!isFormOpen ? (
          <button
            className="primary-button"
            type="button"
            onClick={() => {
              setMutationError(null)
              setIsFormOpen(true)
            }}
          >
            + Adicionar despesa
          </button>
        ) : null}
      </div>

      {isFormOpen ? (
        <ExpenseForm
          currency={currency}
          onCancel={() => setIsFormOpen(false)}
          onSubmit={handleCreate}
        />
      ) : null}

      {mutationError ? (
        <p className="expenses-feedback expenses-feedback--error" role="alert">
          {mutationError}
        </p>
      ) : null}

      {state.status === 'loading' ? (
        <div className="expenses-feedback" role="status" aria-live="polite">
          <span className="loading-state__spinner loading-state__spinner--small" aria-hidden="true" />
          <span>Carregando despesas...</span>
        </div>
      ) : null}

      {state.status === 'error' ? (
        <div className="expenses-feedback expenses-feedback--error" role="alert">
          <p>{state.message}</p>
          <button
            className="secondary-button secondary-button--compact"
            type="button"
            onClick={() => setReloadKey((current) => current + 1)}
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {state.status === 'success' && state.expenses.length === 0 ? (
        <div className="expenses-empty">
          <strong>Nenhuma despesa registrada ainda.</strong>
          <p>
            Adicione sua primeira despesa para começar a acompanhar o ritmo de gastos.
          </p>
        </div>
      ) : null}

      {state.status === 'success' && state.expenses.length > 0 ? (
        <ExpenseList
          expenses={state.expenses}
          currency={currency}
          deletingExpenseId={deletingExpenseId}
          onDelete={(expense) => void handleDelete(expense)}
        />
      ) : null}
    </section>
  )
}
