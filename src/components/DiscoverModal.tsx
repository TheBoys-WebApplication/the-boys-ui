import { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Star, Check, Plus } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useDiscover } from '../hooks/useDiscover';
import { useCreateActivity } from '../hooks/useTrips';
import { DiscoverResult } from '../api/discover';
import { cn } from '../lib/utils';

// ── Category pills ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: 'all',      label: 'All' },
  { slug: 'outdoors', label: 'Outdoors' },
  { slug: 'culture',  label: 'Culture' },
  { slug: 'food',     label: 'Food & Drink' },
  { slug: 'sports',   label: 'Sports' },
] as const;

type CategorySlug = (typeof CATEGORIES)[number]['slug'];

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDistance(m: number): string {
  if (m === 0) return '';
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}

// ── Subcomponents ──────────────────────────────────────────────────────────────

function ResultSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 dark:border-navy-700 dark:bg-navy-800">
      <div className="h-14 w-14 shrink-0 rounded-lg bg-gray-200 dark:bg-navy-700" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/5 rounded bg-gray-200 dark:bg-navy-700" />
        <div className="h-3 w-2/5 rounded bg-gray-100 dark:bg-navy-700" />
      </div>
      <div className="h-8 w-20 shrink-0 rounded-lg bg-gray-100 dark:bg-navy-700" />
    </div>
  );
}

interface ResultCardProps {
  result: DiscoverResult;
  added: boolean;
  pending: boolean;
  onAdd: (result: DiscoverResult) => void;
}

function ResultCard({ result, added, pending, onAdd }: ResultCardProps) {
  const dist = formatDistance(result.distance_m);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 dark:border-navy-700 dark:bg-navy-800">
      {/* Thumbnail */}
      {result.photo_url ? (
        <img
          src={result.photo_url}
          alt={result.name}
          className="h-14 w-14 shrink-0 rounded-lg object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-2xl dark:bg-navy-700">
          <MapPin className="h-5 w-5 text-brand-400" />
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900 dark:text-gray-100">{result.name}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
          <span className="truncate">{result.category}</span>
          {dist && (
            <>
              <span className="text-gray-300 dark:text-navy-600">·</span>
              <span>{dist}</span>
            </>
          )}
          {result.rating !== null && (
            <>
              <span className="text-gray-300 dark:text-navy-600">·</span>
              <span className="flex items-center gap-0.5 text-amber-500">
                <Star className="h-3 w-3 fill-current" />
                {result.rating.toFixed(1)}
              </span>
            </>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-gray-500">{result.address}</p>
      </div>

      {/* Action */}
      {added ? (
        <span className="flex shrink-0 items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
          <Check className="h-3.5 w-3.5" />
          Added
        </span>
      ) : (
        <Button
          size="sm"
          variant="secondary"
          loading={pending}
          onClick={() => onAdd(result)}
          className="shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface DiscoverModalProps {
  tripId: string;
  defaultLocation: string;
  open: boolean;
  onClose: () => void;
}

export default function DiscoverModal({
  tripId,
  defaultLocation,
  open,
  onClose,
}: DiscoverModalProps) {
  const [locationInput, setLocationInput] = useState(defaultLocation);
  const [searchLocation, setSearchLocation] = useState(defaultLocation);
  const [category, setCategory] = useState<CategorySlug>('all');
  const [queryInput, setQueryInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Track which results have been added (place_id) and which are mid-request.
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const locationRef = useRef<HTMLInputElement>(null);
  const createActivity = useCreateActivity(tripId);

  // Reset all state when the modal opens.
  useEffect(() => {
    if (!open) return;
    setLocationInput(defaultLocation);
    setSearchLocation(defaultLocation);
    setCategory('all');
    setQueryInput('');
    setSearchQuery('');
    setAddedIds(new Set());
    setPendingIds(new Set());
    // Focus the location field after open animation.
    setTimeout(() => locationRef.current?.select(), 50);
  }, [open, defaultLocation]);

  const { data: results, isLoading, isError } = useDiscover(
    tripId,
    { location: searchLocation, category, query: searchQuery },
    open,
  );

  // Commit the location + query inputs to trigger a new search.
  const handleSearch = () => {
    const loc = locationInput.trim();
    if (!loc) return;
    setSearchLocation(loc);
    setSearchQuery(queryInput.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleAdd = async (result: DiscoverResult) => {
    if (addedIds.has(result.place_id) || pendingIds.has(result.place_id)) return;

    setPendingIds((prev) => new Set(prev).add(result.place_id));
    try {
      await createActivity.mutateAsync({
        name: result.name,
        location: result.address,
      });
      setAddedIds((prev) => new Set(prev).add(result.place_id));
    } catch {
      // Leave the button in its normal state so the user can retry.
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(result.place_id);
        return next;
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Discover Things To Do"
      className="max-w-2xl"
    >
      {/* ── Search controls ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              ref={locationRef}
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="City or destination…"
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm
                         placeholder-gray-400 shadow-sm focus:border-brand-500 focus:outline-none
                         focus:ring-1 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700
                         dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-brand-400
                         dark:focus:ring-brand-400"
            />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search (optional)…"
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm
                         placeholder-gray-400 shadow-sm focus:border-brand-500 focus:outline-none
                         focus:ring-1 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700
                         dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-brand-400
                         dark:focus:ring-brand-400"
            />
          </div>
          <Button size="sm" onClick={handleSearch}>
            Search
          </Button>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategory(c.slug)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                category === c.slug
                  ? 'bg-brand-600 text-white dark:bg-brand-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results ─────────────────────────────────────────────────────── */}
      <div className="mt-4 max-h-[480px] space-y-2 overflow-y-auto pr-1">
        {isLoading && (
          <>
            <ResultSkeleton />
            <ResultSkeleton />
            <ResultSkeleton />
            <ResultSkeleton />
          </>
        )}

        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center dark:border-red-800 dark:bg-red-950">
            <p className="text-sm text-red-600 dark:text-red-400">
              Could not fetch results. Check your connection and try again.
            </p>
          </div>
        )}

        {!isLoading && !isError && results !== undefined && results.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center dark:border-navy-700">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No places found for this location and category.
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Try a different city name or category.
            </p>
          </div>
        )}

        {!isLoading &&
          results?.map((r) => (
            <ResultCard
              key={r.place_id}
              result={r}
              added={addedIds.has(r.place_id)}
              pending={pendingIds.has(r.place_id)}
              onAdd={handleAdd}
            />
          ))}
      </div>

      {addedIds.size > 0 && (
        <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          {addedIds.size} {addedIds.size === 1 ? 'activity' : 'activities'} added to Ideas
          — switch to the Activities tab to see them.
        </p>
      )}
    </Modal>
  );
}
