import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi, CreateTripData, UpdateTripData, CreateActivityData, UpdateActivityData } from '../api/trips';

// ── Trip queries ──────────────────────────────────────────────────────────────

export function useTrips(groupId: string) {
  return useQuery({
    queryKey: ['groups', groupId, 'trips'],
    queryFn: () => tripsApi.listByGroup(groupId).then((r) => r.data),
    enabled: !!groupId,
  });
}

export function useTrip(tripId: string) {
  return useQuery({
    queryKey: ['trips', tripId],
    queryFn: () => tripsApi.get(tripId).then((r) => r.data),
    enabled: !!tripId,
  });
}

// ── Trip mutations ────────────────────────────────────────────────────────────

export function useCreateTrip(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTripData) =>
      tripsApi.create(groupId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'trips'] });
    },
  });
}

export function useUpdateTrip(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTripData) =>
      tripsApi.update(tripId, data).then((r) => r.data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['trips', tripId] });
      qc.invalidateQueries({ queryKey: ['groups', updated.group_id, 'trips'] });
    },
  });
}

export function useDeleteTrip(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => tripsApi.delete(tripId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'trips'] });
    },
  });
}

// ── Activity queries ──────────────────────────────────────────────────────────

export function useActivities(tripId: string) {
  return useQuery({
    queryKey: ['trips', tripId, 'activities'],
    queryFn: () => tripsApi.listActivities(tripId).then((r) => r.data),
    enabled: !!tripId,
  });
}

// ── Activity mutations ────────────────────────────────────────────────────────

export function useCreateActivity(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateActivityData) =>
      tripsApi.createActivity(tripId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips', tripId, 'activities'] });
      qc.invalidateQueries({ queryKey: ['trips', tripId] }); // refresh counts
    },
  });
}

export function useUpdateActivity(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ activityId, data }: { activityId: string; data: UpdateActivityData }) =>
      tripsApi.updateActivity(activityId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips', tripId, 'activities'] });
      qc.invalidateQueries({ queryKey: ['trips', tripId] }); // refresh counts
    },
  });
}

export function useDeleteActivity(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (activityId: string) => tripsApi.deleteActivity(activityId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips', tripId, 'activities'] });
      qc.invalidateQueries({ queryKey: ['trips', tripId] }); // refresh counts
    },
  });
}
