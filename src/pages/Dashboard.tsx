import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, LogOut, Link as LinkIcon } from 'lucide-react';
import { useAuthContext } from '../store/auth';
import { authApi } from '../api/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import GroupCard from '../components/GroupCard';
import CreateGroupModal from '../components/CreateGroupModal';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import { useGroups, useJoinGroup } from '../hooks/useGroups';
import { useNavigate } from 'react-router-dom';

const joinSchema = z.object({
  invite_code: z.string().min(1, 'Enter an invite code'),
});
type JoinForm = z.infer<typeof joinSchema>;

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: groups, isLoading, error } = useGroups();
  const joinGroup = useJoinGroup();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JoinForm>({ resolver: zodResolver(joinSchema) });

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — always clear client state
    }
    logout();
    navigate('/');
  };

  const onJoin = async (data: JoinForm) => {
    await joinGroup.mutateAsync(data.invite_code.trim());
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-navy-600 dark:bg-navy-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Logo height={52} />
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-gray-600 dark:text-gray-300 sm:block">
              Hey, {user?.display_name} 👋
            </span>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Action bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Groups</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {groups?.length
                ? `${groups.length} group${groups.length !== 1 ? 's' : ''}`
                : 'No groups yet'}
            </p>
          </div>
          <div className="flex gap-2">
            <form onSubmit={handleSubmit(onJoin)} className="flex gap-2">
              <Input
                placeholder="Invite code"
                error={errors.invite_code?.message}
                {...register('invite_code')}
                className="w-36"
              />
              <Button variant="secondary" size="md" type="submit" loading={joinGroup.isPending}>
                <LinkIcon className="h-4 w-4" />
                Join
              </Button>
            </form>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New Group
            </Button>
          </div>
        </div>

        {joinGroup.error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {(joinGroup.error as { response?: { data?: { error?: string } } })?.response?.data
              ?.error ?? 'Could not join group'}
          </p>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-200 dark:bg-navy-700" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Failed to load groups. Refresh the page.
          </p>
        )}

        {!isLoading && groups?.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center dark:border-navy-600">
            <p className="text-gray-400 dark:text-gray-500">No groups yet.</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
              Create one or paste an invite code above.
            </p>
          </div>
        )}

        {!isLoading && groups && groups.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <GroupCard key={g.id} group={g} />
            ))}
          </div>
        )}
      </main>

      <CreateGroupModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
