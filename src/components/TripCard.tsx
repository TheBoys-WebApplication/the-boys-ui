import { Link } from 'react-router-dom';
import { MapPin, Calendar, Lightbulb, CheckCircle, Flag } from 'lucide-react';
import { Trip, TripStatus } from '../api/trips';
import { cn } from '../lib/utils';

const STATUS_STYLES: Record<TripStatus, string> = {
  planning:  'bg-gray-100 text-gray-600 dark:bg-navy-700 dark:text-gray-300',
  upcoming:  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  active:    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_LABELS: Record<TripStatus, string> = {
  planning:  'Planning',
  upcoming:  'Upcoming',
  active:    'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function formatDateRange(start: string | null, end: string | null): string | null {
  if (!start && !end) return null;
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `From ${fmt(start)}`;
  return `Until ${fmt(end!)}`;
}

interface TripCardProps {
  trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
  const dateRange = formatDateRange(trip.start_date, trip.end_date);
  const total =
    trip.activity_counts.idea + trip.activity_counts.confirmed + trip.activity_counts.done;

  return (
    <Link
      to={`/trips/${trip.id}`}
      className={cn(
        'block rounded-xl border border-gray-200 bg-white p-4 shadow-sm',
        'transition-all hover:border-brand-400 hover:shadow-md',
        'dark:border-navy-600 dark:bg-navy-800 dark:hover:border-brand-500',
      )}
    >
      {/* Top row */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{trip.name}</h3>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
            STATUS_STYLES[trip.status],
          )}
        >
          {STATUS_LABELS[trip.status]}
        </span>
      </div>

      {/* Destination */}
      <div className="mb-3 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{trip.destination}</span>
      </div>

      {/* Dates */}
      {dateRange && (
        <div className="mb-3 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>{dateRange}</span>
        </div>
      )}

      {/* Activity pill counts */}
      {total > 0 && (
        <div className="flex items-center gap-2">
          {trip.activity_counts.idea > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-navy-700 dark:text-gray-300">
              <Lightbulb className="h-3 w-3" />
              {trip.activity_counts.idea} idea{trip.activity_counts.idea !== 1 ? 's' : ''}
            </span>
          )}
          {trip.activity_counts.confirmed > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <CheckCircle className="h-3 w-3" />
              {trip.activity_counts.confirmed} confirmed
            </span>
          )}
          {trip.activity_counts.done > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300">
              <Flag className="h-3 w-3" />
              {trip.activity_counts.done} done
            </span>
          )}
        </div>
      )}

      {total === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500">No activities yet</p>
      )}
    </Link>
  );
}
