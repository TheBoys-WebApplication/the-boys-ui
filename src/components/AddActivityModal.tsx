import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useCreateActivity } from '../hooks/useTrips';

const schema = z.object({
  name: z.string().min(1, 'Activity name is required').max(200),
  location: z.string().max(300).optional(),
  activity_date: z.string().optional(),
  estimated_cost: z
    .string()
    .optional()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), {
      message: 'Must be a positive number',
    }),
  description: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof schema>;

interface AddActivityModalProps {
  tripId: string;
  open: boolean;
  onClose: () => void;
}

export default function AddActivityModal({ tripId, open, onClose }: AddActivityModalProps) {
  const createActivity = useCreateActivity(tripId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const handleClose = () => {
    reset();
    createActivity.reset();
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    await createActivity.mutateAsync({
      name: values.name,
      location: values.location || undefined,
      // Convert local datetime-local value to ISO string
      activity_date: values.activity_date
        ? new Date(values.activity_date).toISOString()
        : undefined,
      estimated_cost: values.estimated_cost ? Number(values.estimated_cost) : undefined,
      description: values.description || undefined,
    });
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Activity">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Activity name *"
          placeholder="Axe throwing, rooftop bar..."
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Location"
          placeholder="Venue name or address"
          error={errors.location?.message}
          {...register('location')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Date & time"
            type="datetime-local"
            error={errors.activity_date?.message}
            {...register('activity_date')}
          />
          <Input
            label="Est. cost / person ($)"
            type="number"
            min="0"
            step="0.01"
            placeholder="35"
            error={errors.estimated_cost?.message}
            {...register('estimated_cost')}
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Notes
          </label>
          <textarea
            rows={2}
            placeholder="Any details or links..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm resize-none
                       placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500
                       dark:border-navy-600 dark:bg-navy-800 dark:text-gray-100 dark:placeholder:text-gray-500
                       dark:focus:border-brand-400 dark:focus:ring-brand-400"
            {...register('description')}
          />
        </div>

        {createActivity.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Failed to add activity. Please try again.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createActivity.isPending}>
            Add Activity
          </Button>
        </div>
      </form>
    </Modal>
  );
}
