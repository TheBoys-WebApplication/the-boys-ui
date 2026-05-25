import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Lightbulb,
  CheckCircle,
  Flag,
  Plus,
  Trash2,
  Pencil,
  DollarSign,
  LayoutGrid,
} from 'lucide-react';
import { useAuthContext } from '../store/auth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import ThemeToggle from '../components/ThemeToggle';
import ActivityCard from '../components/ActivityCard';
import AddActivityModal from '../components/AddActivityModal';
import CreateTripModal from '../components/CreateTripModal';
import AddExpenseModal from '../components/AddExpenseModal';
import ExpenseCard from '../components/ExpenseCard';
import BalanceSummary, { SuggestedSettlement } from '../components/BalanceSummary';
import SettleUpModal from '../components/SettleUpModal';
import { useTrip, useActivities, useUpdateActivity, useDeleteActivity, useDeleteTrip, useUpdateTrip } from '../hooks/useTrips';
import { useGroup } from '../hooks/useGroups';
import { useExpenses, useDeleteExpense, useBalances, useSettlements, useDeleteSettlement } from '../hooks/useExpenses';
import { Activity, ActivityStatus, TripStatus } from '../api/trips';
import { Expense } from '../api/expenses';
import { cn } from '../lib/utils';

const STATUS_STYLES: Record<TripStatus, string> = {
  planning:  'bg-gray-100 text-gray-600 dark:bg-navy-700 dark:text-gray-300',
  upcoming:  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  active:    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

const TRIP_STATUSES: TripStatus[] = ['planning', 'upcoming', 'active', 'completed', 'cancelled'];

function formatDateRange(start: string | null, end: string | null): string | null {
  if (!start && !end) return null;
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `From ${fmt(start)}`;
  return `Until ${fmt(end!)}`;
}

type Tab = 'activities' | 'expenses';

export default function TripDetail() {
  const { id: tripId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  // ── Tab ──────────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>('activities');

  // ── Activity state ────────────────────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [editTripOpen, setEditTripOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingStatus, setEditingStatus] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // ── Expense state ─────────────────────────────────────────────────────────
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [settleUpOpen, setSettleUpOpen] = useState(false);
  const [settleUpSuggestion, setSettleUpSuggestion] = useState<SuggestedSettlement | undefined>();
  const [expenseError, setExpenseError] = useState<string | null>(null);

  // Close status dropdown when clicking outside of it.
  useEffect(() => {
    if (!editingStatus) return;
    const handler = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setEditingStatus(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editingStatus]);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: trip, isLoading: tripLoading } = useTrip(tripId!);
  const { data: activities, isLoading: activitiesLoading } = useActivities(tripId!);
  const { data: group } = useGroup(trip?.group_id ?? '');
  const { data: expenses = [] } = useExpenses(tripId!);
  const { data: balances = [] } = useBalances(tripId!);
  const { data: settlements = [] } = useSettlements(tripId!);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const updateActivity   = useUpdateActivity(tripId!);
  const deleteActivity   = useDeleteActivity(tripId!);
  const deleteTrip       = useDeleteTrip(trip?.group_id ?? '');
  const updateTrip       = useUpdateTrip(tripId!);
  const deleteExpense    = useDeleteExpense(tripId!);
  const deleteSettlement = useDeleteSettlement(tripId!);

  // ── Derived ───────────────────────────────────────────────────────────────
  const isLeader      = group?.leader_id === user?.id;
  const isCreator     = trip?.created_by === user?.id;
  const canManageTrip = isLeader || isCreator;

  const ideas     = activities?.filter((a) => a.status === 'idea')      ?? [];
  const confirmed = activities?.filter((a) => a.status === 'confirmed') ?? [];
  const done      = activities?.filter((a) => a.status === 'done')      ?? [];

  // ── Activity handlers ─────────────────────────────────────────────────────

  const handleEditActivity = (activity: Activity) => setEditingActivity(activity);

  const handleAdvance = async (activityId: string, status: ActivityStatus) => {
    try {
      setActivityError(null);
      await updateActivity.mutateAsync({ activityId, data: { status } });
    } catch {
      setActivityError('Could not update activity. Please try again.');
    }
  };

  const handleRevert = async (activityId: string, status: ActivityStatus) => {
    try {
      setActivityError(null);
      await updateActivity.mutateAsync({ activityId, data: { status } });
    } catch {
      setActivityError('Could not update activity. Please try again.');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Remove this activity?')) return;
    try {
      setActivityError(null);
      await deleteActivity.mutateAsync(activityId);
    } catch {
      setActivityError('Could not remove activity. Please try again.');
    }
  };

  const handleDeleteTrip = async () => {
    if (!confirm(`Delete "${trip?.name}"? This will also delete all activities and expenses.`)) return;
    await deleteTrip.mutateAsync(tripId!);
    navigate(`/groups/${trip?.group_id}`);
  };

  const handleStatusChange = async (status: TripStatus) => {
    await updateTrip.mutateAsync({ status });
    setEditingStatus(false);
  };

  // ── Expense handlers ──────────────────────────────────────────────────────

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Remove this expense?')) return;
    try {
      setExpenseError(null);
      await deleteExpense.mutateAsync(id);
    } catch {
      setExpenseError('Could not remove expense. Please try again.');
    }
  };

  const handleDeleteSettlement = async (id: string) => {
    if (!confirm('Remove this payment record?')) return;
    try {
      setExpenseError(null);
      await deleteSettlement.mutateAsync(id);
    } catch {
      setExpenseError('Could not remove payment record. Please try again.');
    }
  };

  const handleSettleUp = (suggestion?: SuggestedSettlement) => {
    setSettleUpSuggestion(suggestion);
    setSettleUpOpen(true);
  };

  const handleSettleUpClose = () => {
    setSettleUpOpen(false);
    setSettleUpSuggestion(undefined);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (tripLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center dark:bg-navy-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent dark:border-brand-400" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 dark:bg-navy-900">
        <p className="text-gray-500 dark:text-gray-400">Trip not found.</p>
        <Link to="/" className="text-sm text-brand-600 hover:underline dark:text-brand-400">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const dateRange = formatDateRange(trip.start_date, trip.end_date);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="border-b border-gray-200 bg-white dark:border-navy-600 dark:bg-navy-800">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          <Link
            to={`/groups/${trip.group_id}`}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-gray-900 dark:text-gray-100">
              {trip.name}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {trip.destination}
              </span>
              {dateRange && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {dateRange}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {canManageTrip && (
              <Button variant="secondary" size="sm" onClick={() => setEditTripOpen(true)}>
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
            {/* Status badge / editor */}
            {canManageTrip ? (
              <div className="relative" ref={statusDropdownRef}>
                <button
                  onClick={() => setEditingStatus((p) => !p)}
                  className={cn(
                    'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
                    STATUS_STYLES[trip.status],
                    'transition-opacity hover:opacity-80',
                  )}
                >
                  <Pencil className="h-3 w-3" />
                  {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                </button>
                {editingStatus && (
                  <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-xl border border-gray-200 bg-white shadow-lg dark:border-navy-600 dark:bg-navy-800">
                    {TRIP_STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className={cn(
                          'w-full px-3 py-2 text-left text-sm capitalize hover:bg-gray-50 dark:hover:bg-navy-700',
                          'first:rounded-t-xl last:rounded-b-xl',
                          s === trip.status
                            ? 'font-semibold text-brand-600 dark:text-brand-400'
                            : 'text-gray-700 dark:text-gray-300',
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span className={cn('rounded-full px-3 py-1 text-xs font-medium', STATUS_STYLES[trip.status])}>
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
              </span>
            )}
            {isLeader && (
              <Button variant="danger" size="sm" onClick={handleDeleteTrip} loading={deleteTrip.isPending}>
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Description */}
        {trip.description && (
          <p className="mb-6 text-gray-600 dark:text-gray-400">{trip.description}</p>
        )}

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="mb-6 flex gap-1 border-b border-gray-200 dark:border-navy-700">
          <button
            onClick={() => setTab('activities')}
            className={cn(
              '-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === 'activities'
                ? 'border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Activities
          </button>
          <button
            onClick={() => setTab('expenses')}
            className={cn(
              '-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === 'expenses'
                ? 'border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            )}
          >
            <DollarSign className="h-4 w-4" />
            Expenses
          </button>
        </div>

        {/* ── Activities tab ────────────────────────────────────────────── */}
        {tab === 'activities' && (
          <>
            {/* Activity error banner */}
            {activityError && (
              <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                <span>{activityError}</span>
                <button
                  onClick={() => setActivityError(null)}
                  className="ml-3 text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Activities</h2>
              <Button onClick={() => setAddOpen(true)} size="sm">
                <Plus className="h-4 w-4" />
                Add Activity
              </Button>
            </div>

            {activitiesLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-navy-800" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* Ideas column */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Ideas ({ideas.length})
                    </span>
                  </div>
                  <div className="space-y-3">
                    {ideas.map((a) => (
                      <ActivityCard
                        key={a.id}
                        activity={a}
                        currentUserId={user?.id ?? ''}
                        isLeader={isLeader}
                        onAdvance={handleAdvance}
                        onRevert={handleRevert}
                        onEdit={handleEditActivity}
                        onDelete={handleDeleteActivity}
                        isUpdating={updateActivity.isPending || deleteActivity.isPending}
                      />
                    ))}
                    {ideas.length === 0 && (
                      <Card className="border-dashed py-8 text-center">
                        <p className="text-sm text-gray-400 dark:text-gray-500">No ideas yet</p>
                        <button
                          onClick={() => setAddOpen(true)}
                          className="mt-1 text-sm text-brand-600 hover:underline dark:text-brand-400"
                        >
                          + Add one
                        </button>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Confirmed column */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Confirmed ({confirmed.length})
                    </span>
                  </div>
                  <div className="space-y-3">
                    {confirmed.map((a) => (
                      <ActivityCard
                        key={a.id}
                        activity={a}
                        currentUserId={user?.id ?? ''}
                        isLeader={isLeader}
                        onAdvance={handleAdvance}
                        onRevert={handleRevert}
                        onEdit={handleEditActivity}
                        onDelete={handleDeleteActivity}
                        isUpdating={updateActivity.isPending || deleteActivity.isPending}
                      />
                    ))}
                    {confirmed.length === 0 && (
                      <Card className="border-dashed py-8 text-center">
                        <p className="text-sm text-gray-400 dark:text-gray-500">Nothing confirmed yet</p>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Done column */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Flag className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Done ({done.length})
                    </span>
                  </div>
                  <div className="space-y-3">
                    {done.map((a) => (
                      <ActivityCard
                        key={a.id}
                        activity={a}
                        currentUserId={user?.id ?? ''}
                        isLeader={isLeader}
                        onAdvance={handleAdvance}
                        onRevert={handleRevert}
                        onEdit={handleEditActivity}
                        onDelete={handleDeleteActivity}
                        isUpdating={updateActivity.isPending || deleteActivity.isPending}
                      />
                    ))}
                    {done.length === 0 && (
                      <Card className="border-dashed py-8 text-center">
                        <p className="text-sm text-gray-400 dark:text-gray-500">Nothing done yet</p>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Expenses tab ──────────────────────────────────────────────── */}
        {tab === 'expenses' && (
          <div className="space-y-8">
            {/* Expense error banner */}
            {expenseError && (
              <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                <span>{expenseError}</span>
                <button
                  onClick={() => setExpenseError(null)}
                  className="ml-3 text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Expenses list */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Expenses</h2>
                <Button size="sm" onClick={() => setAddExpenseOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
              </div>
              {expenses.length === 0 ? (
                <Card className="border-dashed py-10 text-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">No expenses yet</p>
                  <button
                    onClick={() => setAddExpenseOpen(true)}
                    className="mt-1 text-sm text-brand-600 hover:underline dark:text-brand-400"
                  >
                    + Add the first one
                  </button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {expenses.map((e) => (
                    <ExpenseCard
                      key={e.id}
                      expense={e}
                      currentUserId={user?.id ?? ''}
                      isLeader={isLeader}
                      onEdit={setEditingExpense}
                      onDelete={handleDeleteExpense}
                      isDeleting={deleteExpense.isPending}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Balances & settle-up */}
            <BalanceSummary
              balances={balances}
              settlements={settlements}
              currentUserId={user?.id ?? ''}
              isLeader={isLeader}
              onSettleUp={handleSettleUp}
              onDeleteSettlement={handleDeleteSettlement}
              isDeletingSettlement={deleteSettlement.isPending}
            />
          </div>
        )}
      </main>

      {/* ── Modals ────────────────────────────────────────────────────────── */}

      {/* Add activity */}
      <AddActivityModal
        tripId={tripId!}
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />

      {/* Edit activity */}
      <AddActivityModal
        tripId={tripId!}
        activity={editingActivity ?? undefined}
        open={editingActivity !== null}
        onClose={() => setEditingActivity(null)}
      />

      {/* Edit trip */}
      <CreateTripModal
        groupId={trip.group_id}
        trip={trip}
        open={editTripOpen}
        onClose={() => setEditTripOpen(false)}
      />

      {/* Add expense */}
      <AddExpenseModal
        tripId={tripId!}
        groupId={trip.group_id}
        currentUserId={user?.id ?? ''}
        open={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
      />

      {/* Edit expense */}
      <AddExpenseModal
        tripId={tripId!}
        groupId={trip.group_id}
        currentUserId={user?.id ?? ''}
        expense={editingExpense ?? undefined}
        open={editingExpense !== null}
        onClose={() => setEditingExpense(null)}
      />

      {/* Settle up */}
      <SettleUpModal
        tripId={tripId!}
        groupId={trip.group_id}
        currentUserId={user?.id ?? ''}
        suggestion={settleUpSuggestion}
        open={settleUpOpen}
        onClose={handleSettleUpClose}
      />
    </div>
  );
}
