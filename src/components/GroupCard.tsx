import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Group } from '../api/groups';
import { Card } from './ui/Card';
import { formatDate } from '../lib/utils';

interface GroupCardProps {
  group: Group;
}

export default function GroupCard({ group }: GroupCardProps) {
  return (
    <Link to={`/groups/${group.id}`}>
      <Card className="cursor-pointer transition-shadow hover:shadow-md dark:hover:shadow-gray-900">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-gray-900 dark:text-gray-100">
              {group.name}
            </h3>
            {group.description && (
              <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
                {group.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1 text-sm text-gray-400 dark:text-gray-500">
            <Users className="h-4 w-4" />
            <span>{group.member_count}</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          Created {formatDate(group.created_at)}
        </p>
      </Card>
    </Link>
  );
}
