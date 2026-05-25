import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useCreateTrip } from '../hooks/useTrips';

const schema = z
  .object({
    name: z.string().min(1, 'Trip name is required').max(100),
    destination: z.string().min(1, 'Destination is required').max(200),
    description: z.string().max(500).optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  })
  .refine(
    (d) => {
      if (d.start_date && d.end_date) return d.end_date >= d.start_date;
      return true;
    },
    { message: 'End date must be on or after start date', path: ['end_date'] },
  );

type FormValues = z.infer<typeof schema>;

interface CreateTripModalProps {
  groupId: string;
  open: boolean;
  onClose: () => void;
}

export default function CreateTripModal({ groupId, open, onClose }: CreateTripModalProps) {
  const createTrip = useCreateTrip(groupId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const handleClose = () => {
    reset();
    createTrip.reset();
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    await createTrip.mutateAsync({
      name: values.name,
      destination: values.destination,
      description: values.description || undefined,
      start_date: values.start_date || undefined,
      end_date: values.end_date || undefined,
    });
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="New Trip">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Trip name *"
          placeholder="Nashville June"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Destination *"
          placeholder="Nashville, TN"
          error={errors.destination?.message}
          {...register('destination')}
        />

        {/* Date row */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start date"
            type="date"
            error={errors.start_date?.message}
            {...register('start_date')}
          />
          <Input
            label="End date"
            type="date"
            error={errors.end_date?.message}
            {...register('end_date')}
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="What's the vibe?"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm resize-none
                       placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500
                       dark:border-navy-600 dark:bg-navy-800 dark:text-gray-100 dark:placeholder:text-gray-500
                       dark:focus:border-brand-400 dark:focus:ring-brand-400"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.description.message}</p>
          )}
        </div>

        {createTrip.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Failed to create trip. Please try again.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createTrip.isPending}>
            Create Trip
          </Button>
        </div>
      </form>
    </Modal>
  );
}
