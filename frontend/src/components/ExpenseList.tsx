import { EXPENSE_CATEGORY_LABELS, type Expense } from '../types/expense'
import { formatDate, formatMoney } from '../utils/formatters'

interface ExpenseListProps {
  expenses: Expense[]
  currency: string
  deletingExpenseId: string | null
  onDelete: (expense: Expense) => void
}

export function ExpenseList({
  expenses,
  currency,
  deletingExpenseId,
  onDelete,
}: ExpenseListProps) {
  return (
    <ul className="expense-list">
      {expenses.map((expense) => {
        const isDeleting = deletingExpenseId === expense.id

        return (
          <li className="expense-item" key={expense.id}>
            <div className="expense-item__main">
              <strong>{expense.description}</strong>
              <span>
                {EXPENSE_CATEGORY_LABELS[expense.category]} ·{' '}
                {formatDate(expense.expenseDate)}
              </span>
            </div>

            <div className="expense-item__actions">
              <strong>{formatMoney(expense.amountCents, currency)}</strong>
              <button
                className="expense-delete"
                type="button"
                onClick={() => onDelete(expense)}
                disabled={deletingExpenseId !== null}
                aria-label={`Excluir despesa ${expense.description}`}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
