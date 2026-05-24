import { api } from '../lib/axios';

export interface ActivityCounts {
  idea: number;
  confirmed: number;
  done: number;
}

export interface Trip {
  id: string;
  group_id: string;
  created_by: string;
  name: string;
  destination: string;
  description: string | null;
  start_date: string | null;   // "YYYY-MM-DD"
  end_date: string | null;     // "YYYY-MM-DD"
  status: TripStatus;
  activity_counts: ActivityCounts;
  created_at: string;
  updated_at: string;
}

export type TripStatus = 'planning' | 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface Activity {
  id: string;
  trip_id: string;
  suggested_by: string;
  suggested_by_name: string;
  name: string;
  description: string | null;
  location: string | null;
  activity_date: string | null; // ISO 8601
  estimated_cost: number | null;
  status: ActivityStatus;
  created_at: string;
  updated_at: string;
}

export type ActivityStatus = 'idea' | 'confirmed' | 'done';

export interface CreateTripData {
  name: string;
  destination: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

export interface UpdateTripData {
  name?: string;
  destination?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: TripStatus;
}

export interface CreateActivityData {
  name: string;
  description?: string;
  location?: string;
  activity_date?: string;
  estimated_cost?: number;
}

export interface UpdateActivityData {
  name?: string;
  description?: string;
  location?: string;
  activity_date?: string;
  estimated_cost?: number;
  status?: ActivityStatus;
}

export const tripsApi = {
  // Trips
  listByGroup: (groupId: string) =>
    api.get<Trip[]>(`/groups/${groupId}/trips`),

  create: (groupId: string, data: CreateTripData) =>
    api.post<Trip>(`/groups/${groupId}/trips`, data),

  get: (tripId: string) =>
    api.get<Trip>(`/trips/${tripId}`),

  update: (tripId: string, data: UpdateTripData) =>
    api.put<Trip>(`/trips/${tripId}`, data),

  delete: (tripId: string) =>
    api.delete(`/trips/${tripId}`),

  // Activities
  listActivities: (tripId: string) =>
    api.get<Activity[]>(`/trips/${tripId}/activities`),

  createActivity: (tripId: string, data: CreateActivityData) =>
    api.post<Activity>(`/trips/${tripId}/activities`, data),

  updateActivity: (activityId: string, data: UpdateActivityData) =>
    api.put<Activity>(`/activities/${activityId}`, data),

  deleteActivity: (activityId: string) =>
    api.delete(`/activities/${activityId}`),
};
