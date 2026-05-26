import { useQuery } from '@tanstack/react-query';
import { discoverApi, DiscoverParams } from '../api/discover';

export function useDiscover(tripId: string, params: DiscoverParams, enabled: boolean) {
  return useQuery({
    queryKey: ['discover', tripId, params],
    queryFn: () => discoverApi.search(tripId, params).then((r) => r.data),
    // Only fire when the modal is open and we have a location to search.
    enabled: enabled && !!params.location?.trim(),
    // Mirror the 1-hour server-side cache so we don't refetch unnecessarily.
    staleTime: 60 * 60 * 1000,
  });
}
