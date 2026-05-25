import { ArrowRight, CheckCircle } from 'lucide-react';
import { Balance, Settlement } from '../api/expenses';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { formatDate } from '../lib/utils';

// ── Debt simplification algorithm ─────────────────────────────────────────────

export interface SuggestedSettlement {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
}

export function computeSuggestions(balances: Balance[]): SuggestedSettlement[] {
  // Copy, filter near-zero balances.
  const debtors = balances
    .filter((b) => b.net < -0.01)
    .map((b) => ({ id: b.user_id, name: b.display_name, remaining: -b.net }))
    .sort((a, b) => b.remaining - a.remaining);

  const creditors = balances
    .filter((b) => b.net > 0.01)
    .map((b) => ({ id: b.user_id, name: b.display_name, remaining: b.net }))
    .sort((a, b) => b.remaining - a.remaining);

  const suggestions: SuggestedSettlement[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.remaining, creditor.remaining);
    const rounded = Math.round(amount * 100) / 100;

    if (rounded >= 0.01) {
      suggestions.push({
        fromId: debtor.id,
        fromName: debtor.name,
        toId: creditor.id,
        toName: creditor.name,
        amount: rounded,
      });
    }

    debtor.remaining -= amount;
    creditor.remaining -= amount;

    if (debtor.remaining < 0.01) i++;
    if (creditor.remaining < 0.01) j++;
  }

  return suggestions;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface BalanceSummaryProps {
  balances: Balance[];
  settlements: Settlement[];
  currentUserId: string;
  isLeader: boolean;
  onSettleUp: (suggestion?: SuggestedSettlement) => void;
  onDeleteSettlement: (id: string) => void;
  isDeletingSettlement: boolean;
}

export default function BalanceSummary({
  balances,
  settlements,
  currentUserId,
  isLeader,
  onSettleUp,
  onDeleteSettlement,
  isDeletingSettlement,
}: BalanceSummaryProps) {
  const suggestions = computeSuggestions(balances);
  const allSettled = suggestions.length === 0;

  return (
    <div className="space-y-6">
      {/* Per-person balance cards */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Balances
        </h3>
        {balances.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No expenses recorded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {balances.map((b) => (
              <div
                key={b.user_id}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-navy-700 dark:bg-navy-800"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700 dark:bg-navy-700 dark:text-gray-300">
                  {b.display_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {b.display_name}
                    {b.user_id === currentUserId ? ' (you)' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    paid ${b.paid.toFixed(2)} · owes ${b.owed.toFixed(2)}
                    {(b.settled_out > 0 || b.settled_in > 0) && (
                      <> · settled ±${Math.max(b.settled_out, b.settled_in).toFixed(2)}</>
                    )}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 text-base font-bold tabular-nums',
                    b.net > 0.01 && 'text-green-600 dark:text-green-400',
                    b.net < -0.01 && 'text-red-600 dark:text-red-400',
                    Math.abs(b.net) <= 0.01 && 'text-gray-400 dark:text-gray-500',
                  )}
                >
                  {b.net > 0.01
                    ? `+$${b.net.toFixed(2)}`
                    : b.net < -0.01
                    ? `-$${Math.abs(b.net).toFixed(2)}`
                    : '✓ settled'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested settlements */}
      {balances.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Suggested Payments
            </h3>
            <Button size="sm" onClick={() => onSettleUp()}>
              Record Payment
            </Button>
          </div>

          {allSettled ? (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">Everyone is settled up!</span>
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-navy-700 dark:bg-navy-800"
                >
                  <div className="min-w-0 flex-1 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                    <span className="font-medium truncate">{s.fromName}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span className="font-medium truncate">{s.toName}</span>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                    ${s.amount.toFixed(2)}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onSettleUp(s)}
                    className="shrink-0"
                  >
                    Record
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recorded settlements */}
      {settlements.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Recorded Payments ({settlements.length})
          </h3>
          <div className="space-y-2">
            {settlements.map((s) => {
              const canDelete = s.paid_by === currentUserId || isLeader;
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-navy-700 dark:bg-navy-800"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-sm text-gray-800 dark:text-gray-200">
                      <span className="font-medium">{s.paid_by_name}</span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="font-medium">{s.paid_to_name}</span>
                      {s.note && (
                        <span className="text-gray-400 dark:text-gray-500">— {s.note}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(s.created_at)}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                    ${s.amount.toFixed(2)}
                  </span>
                  {canDelete && (
                    <button
                      onClick={() => onDeleteSettlement(s.id)}
                      disabled={isDeletingSettlement}
                      className="shrink-0 text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-40"
                      title="Remove this record"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
