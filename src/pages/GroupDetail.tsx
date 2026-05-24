import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, RefreshCw, Trash2, UserMinus, Crown } from 'lucide-react';
import { useAuthContext } from '../store/auth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import ThemeToggle from '../components/ThemeToggle';
import {
  useGroup,
  useGroupMembers,
  useRegenerateInvite,
  useRemoveMember,
  useDeleteGroup,
} from '../hooks/useGroups';
import { formatDate, copyToClipboard } from '../lib/utils';

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [copied, setCopied] = useState(false);

  const { data: group, isLoading: groupLoading } = useGroup(id!);
  const { data: members, isLoading: membersLoading } = useGroupMembers(id!);
  const regenerate = useRegenerateInvite(id!);
  const removeMember = useRemoveMember(id!);
  const deleteGroup = useDeleteGroup();

  const isLeader = group?.leader_id === user?.id;

  const handleCopy = async () => {
    if (!group) return;
    await copyToClipboard(group.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    if (!confirm('Regenerate invite code? The old link will stop working.')) return;
    await regenerate.mutateAsync();
  };

  const handleDeleteGroup = async () => {
    if (!confirm(`Delete "${group?.name}"? This cannot be undone.`)) return;
    await deleteGroup.mutateAsync(id!);
    navigate('/');
  };

  const handleRemoveMember = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from the group?`)) return;
    await removeMember.mutateAsync(userId);
  };

  if (groupLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center dark:bg-navy-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent dark:border-brand-400" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 dark:bg-navy-900">
        <p className="text-gray-500 dark:text-gray-400">Group not found.</p>
        <Link to="/" className="text-sm text-brand-600 hover:underline dark:text-brand-400">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-navy-600 dark:bg-navy-800">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Link
            to="/"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-gray-900 dark:text-gray-100">
              {group.name}
            </h1>
            {group.description && (
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                {group.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isLeader && (
              <Button variant="danger" size="sm" onClick={handleDeleteGroup}>
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete Group</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* Invite code */}
        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Invite Code
          </h2>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-gray-100 px-3 py-2 font-mono text-sm text-gray-800 dark:bg-navy-700 dark:text-gray-100">
              {group.invite_code}
            </code>
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            {isLeader && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                loading={regenerate.isPending}
                title="Regenerate code"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Share this code with friends — they can join from the dashboard.
          </p>
        </Card>

        {/* Members */}
        <Card>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Members ({members?.length ?? 0})
          </h2>

          {membersLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-navy-700"
                />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-navy-600">
              {members?.map((m) => (
                <li key={m.user_id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-navy-700 dark:text-brand-300">
                      {m.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {m.display_name}
                      </span>
                      {m.role === 'leader' && (
                        <Crown className="ml-1.5 inline h-3.5 w-3.5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Joined {formatDate(m.joined_at)}
                    </span>
                    {isLeader && m.user_id !== user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(m.user_id, m.display_name)}
                        loading={removeMember.isPending}
                        title="Remove member"
                        className="text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          Group created {formatDate(group.created_at)} · {group.member_count} member
          {group.member_count !== 1 ? 's' : ''}
        </p>
      </main>
    </div>
  );
}
