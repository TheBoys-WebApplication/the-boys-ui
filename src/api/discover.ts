import { api } from '../lib/axios';

export interface DiscoverResult {
  place_id: string;
  name: string;
  category: string;
  address: string;
  distance_m: number;
  rating: number | null;
  photo_url: string | null;
}

export interface DiscoverParams {
  location?: string;
  category?: string;
  query?: string;
}

export const discoverApi = {
  search: (tripId: string, params: DiscoverParams) =>
    api.get<DiscoverResult[]>(`/trips/${tripId}/discover`, { params }),
};
