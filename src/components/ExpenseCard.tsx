import { Trash2, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Expense } from '../api/expenses';
import { Button } from './ui/Button';
import { formatDate } from '../lib/utils';
import { cn } from '../lib/utils';

interface ExpenseCardProps {
  expense: Expense;
  currentUserId: string;
  isLeader: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export default function ExpenseCard({
  expense,
  currentUserId,
  isLeader,
  onEdit,
  onDelete,
  isDeleting,
}: ExpenseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const canEditOrDelete = expense.paid_by === currentUserId || isLeader;

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-navy-600 dark:bg-navy-800">
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {expense.description}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Paid by <span className="font-medium">{expense.paid_by_name}</span>
            {' · '}{formatDate(expense.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ${expense.amount.toFixed(2)}
          </span>

          {canEditOrDelete && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(expense)}
                disabled={isDeleting}
                className="px-2 py-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Edit expense"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(expense.id)}
                disabled={isDeleting}
                className="px-2 py-1 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                title="Delete expense"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}

          {expense.splits.length > 0 && (
            <button
              onClick={() => setExpanded((p) => !p)}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-700"
              title={expanded ? 'Hide splits' : 'Show splits'}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Splits breakdown */}
      {expanded && expense.splits.length > 0 && (
        <div className="border-t border-gray-100 px-4 pb-3 pt-2 dark:border-navy-700">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Split ({expense.splits.length} people)
          </p>
          <div className="space-y-1">
            {expense.splits.map((s) => (
              <div key={s.user_id} className="flex items-center justify-between">
                <span
                  className={cn(
                    'text-sm text-gray-700 dark:text-gray-300',
                    s.user_id === currentUserId && 'font-semibold',
                  )}
                >
                  {s.display_name}
                  {s.user_id === currentUserId ? ' (you)' : ''}
                </span>
                <span className="text-sm tabular-nums text-gray-700 dark:text-gray-300">
                  ${s.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
