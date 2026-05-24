import { api } from '../lib/axios';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  leader_id: string;
  invite_code: string;
  member_count: number;
  created_at: string;
}

export interface Member {
  user_id: string;
  display_name: string;
  role: string;
  joined_at: string;
}

export const groupsApi = {
  list: () => api.get<Group[]>('/groups'),

  create: (name: string, description?: string) =>
    api.post<Group>('/groups', { name, description }),

  get: (id: string) => api.get<Group>(`/groups/${id}`),

  update: (id: string, data: { name?: string; description?: string }) =>
    api.put<Group>(`/groups/${id}`, data),

  delete: (id: string) => api.delete(`/groups/${id}`),

  listMembers: (id: string) => api.get<Member[]>(`/groups/${id}/members`),

  regenerateInvite: (id: string) =>
    api.post<{ invite_code: string }>(`/groups/${id}/invite/regenerate`),

  join: (invite_code: string) => api.post<Group>('/groups/join', { invite_code }),

  removeMember: (groupId: string, userId: string) =>
    api.delete(`/groups/${groupId}/members/${userId}`),
};
