import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useCreateGroup } from '../hooks/useGroups';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  description: z.string().max(300).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateGroupModal({ open, onClose }: Props) {
  const createGroup = useCreateGroup();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await createGroup.mutateAsync({ name: data.name, description: data.description || undefined });
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create a Group">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Group name"
          placeholder="Summer Vegas Trip"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Description (optional)"
          placeholder="What's this group for?"
          error={errors.description?.message}
          {...register('description')}
        />
        {createGroup.error && (
          <p className="text-sm text-red-600">
            {(createGroup.error as { response?: { data?: { error?: string } } })?.response?.data
              ?.error ?? 'Something went wrong'}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createGroup.isPending}>
            Create Group
          </Button>
        </div>
      </form>
    </Modal>
  );
}
