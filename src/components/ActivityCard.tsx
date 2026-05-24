import { MapPin, Calendar, DollarSign, User, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Activity, ActivityStatus } from '../api/trips';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

const NEXT_STATUS: Record<ActivityStatus, ActivityStatus | null> = {
  idea: 'confirmed',
  confirmed: 'done',
  done: null,
};

const PREV_STATUS: Record<ActivityStatus, ActivityStatus | null> = {
  idea: null,
  confirmed: 'idea',
  done: 'confirmed',
};

const ADVANCE_LABEL: Record<ActivityStatus, string> = {
  idea: 'Confirm',
  confirmed: 'Mark Done',
  done: '',
};

const REVERT_LABEL: Record<ActivityStatus, string> = {
  idea: '',
  confirmed: 'Back to Idea',
  done: 'Back to Confirmed',
};

function formatActivityDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

interface ActivityCardProps {
  activity: Activity;
  currentUserId: string;
  isLeader: boolean;
  onAdvance: (id: string, status: ActivityStatus) => void;
  onRevert: (id: string, status: ActivityStatus) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}

export default function ActivityCard({
  activity,
  currentUserId,
  isLeader,
  onAdvance,
  onRevert,
  onDelete,
  isUpdating,
}: ActivityCardProps) {
  const next = NEXT_STATUS[activity.status];
  const prev = PREV_STATUS[activity.status];
  const canDelete = activity.suggested_by === currentUserId || isLeader;

  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-3 shadow-sm',
        'dark:bg-navy-800',
        activity.status === 'idea' && 'border-gray-200 dark:border-navy-600',
        activity.status === 'confirmed' && 'border-blue-200 dark:border-blue-800',
        activity.status === 'done' && 'border-green-200 dark:border-green-900 opacity-75',
      )}
    >
      {/* Name */}
      <p
        className={cn(
          'mb-1.5 font-medium text-gray-900 dark:text-gray-100',
          activity.status === 'done' && 'line-through text-gray-400 dark:text-gray-500',
        )}
      >
        {activity.name}
      </p>

      {/* Meta */}
      <div className="mb-2 space-y-1">
        {activity.location && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{activity.location}</span>
          </div>
        )}
        {activity.activity_date && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{formatActivityDate(activity.activity_date)}</span>
          </div>
        )}
        {activity.estimated_cost != null && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <DollarSign className="h-3 w-3 shrink-0" />
            <span>${activity.estimated_cost.toFixed(2)} / person</span>
          </div>
        )}
        {activity.description && (
          <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2">
            {activity.description}
          </p>
        )}
      </div>

      {/* Suggested by */}
      <div className="mb-3 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
        <User className="h-3 w-3" />
        <span>{activity.suggested_by_name}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {prev && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRevert(activity.id, prev)}
            disabled={isUpdating}
            className="text-xs px-2 py-1"
            title={REVERT_LABEL[activity.status]}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{REVERT_LABEL[activity.status]}</span>
          </Button>
        )}
        {next && (
          <Button
            variant={activity.status === 'idea' ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => onAdvance(activity.id, next)}
            disabled={isUpdating}
            className="text-xs px-2 py-1"
          >
            {ADVANCE_LABEL[activity.status]}
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}
        <span className="flex-1" />
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(activity.id)}
            disabled={isUpdating}
            className="text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 px-2 py-1"
            title="Remove activity"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
