import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useCreateActivity, useUpdateActivity } from '../hooks/useTrips';
import { Activity } from '../api/trips';

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

/** Convert UTC ISO string → local datetime-local input value ("YYYY-MM-DDTHH:MM"). */
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

interface AddActivityModalProps {
  tripId: string;
  /** Pass an existing activity to switch to edit mode. */
  activity?: Activity;
  open: boolean;
  onClose: () => void;
}

export default function AddActivityModal({ tripId, activity, open, onClose }: AddActivityModalProps) {
  const isEditing = !!activity;

  const createActivity = useCreateActivity(tripId);
  const updateActivity = useUpdateActivity(tripId);

  const mutation = isEditing ? updateActivity : createActivity;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Pre-fill when editing; reset when creating or modal closes.
  useEffect(() => {
    if (open && isEditing && activity) {
      reset({
        name: activity.name,
        location: activity.location ?? '',
        activity_date: activity.activity_date ? toDatetimeLocal(activity.activity_date) : '',
        estimated_cost: activity.estimated_cost != null ? String(activity.estimated_cost) : '',
        description: activity.description ?? '',
      });
    } else if (!open) {
      reset({});
    }
  }, [open, isEditing, activity, reset]);

  const handleClose = () => {
    reset({});
    mutation.reset();
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      location: values.location || undefined,
      activity_date: values.activity_date
        ? new Date(values.activity_date).toISOString()
        : undefined,
      estimated_cost: values.estimated_cost ? Number(values.estimated_cost) : undefined,
      description: values.description || undefined,
    };

    if (isEditing && activity) {
      await updateActivity.mutateAsync({ activityId: activity.id, data: payload });
    } else {
      await createActivity.mutateAsync(payload);
    }
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={isEditing ? 'Edit Activity' : 'Add Activity'}>
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

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
          <textarea
            rows={2}
            placeholder="Any details or links..."
            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm
                       placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500
                       dark:border-navy-600 dark:bg-navy-800 dark:text-gray-100 dark:placeholder:text-gray-500
                       dark:focus:border-brand-400 dark:focus:ring-brand-400"
            {...register('description')}
          />
        </div>

        {mutation.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {isEditing ? 'Failed to save changes.' : 'Failed to add activity.'} Please try again.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {isEditing ? 'Save Changes' : 'Add Activity'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
