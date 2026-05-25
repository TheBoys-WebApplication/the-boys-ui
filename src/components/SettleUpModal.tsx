import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useCreateSettlement } from '../hooks/useExpenses';
import { useGroupMembers } from '../hooks/useGroups';
import { SuggestedSettlement } from './BalanceSummary';

const schema = z
  .object({
    paid_by: z.string().min(1, 'Select who paid'),
    paid_to: z.string().min(1, 'Select who received'),
    amount: z
      .string()
      .min(1, 'Amount is required')
      .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
        message: 'Must be greater than zero',
      }),
    note: z.string().max(200).optional(),
  })
  .refine((d) => d.paid_by !== d.paid_to, {
    message: 'Payer and receiver must be different people',
    path: ['paid_to'],
  });

type FormValues = z.infer<typeof schema>;

interface SettleUpModalProps {
  tripId: string;
  groupId: string;
  currentUserId: string;
  /** Pre-fill from a suggested settlement. */
  suggestion?: SuggestedSettlement;
  open: boolean;
  onClose: () => void;
}

export default function SettleUpModal({
  tripId,
  groupId,
  currentUserId,
  suggestion,
  open,
  onClose,
}: SettleUpModalProps) {
  const { data: members = [] } = useGroupMembers(groupId);
  const createSettlement = useCreateSettlement(tripId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!open) {
      reset({});
      return;
    }
    reset({
      paid_by: suggestion?.fromId ?? currentUserId,
      paid_to: suggestion?.toId ?? '',
      amount: suggestion ? String(suggestion.amount) : '',
      note: '',
    });
  }, [open, suggestion, currentUserId, reset]);

  const handleClose = () => {
    reset({});
    createSettlement.reset();
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    await createSettlement.mutateAsync({
      paid_by: values.paid_by,
      paid_to: values.paid_to,
      amount: Number(values.amount),
      note: values.note || undefined,
    });
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Record Payment">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Who paid */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Who paid? *
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm
                       focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500
                       dark:border-navy-600 dark:bg-navy-800 dark:text-gray-100
                       dark:focus:border-brand-400 dark:focus:ring-brand-400"
            {...register('paid_by')}
          >
            <option value="">Select person</option>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.display_name}
                {m.user_id === currentUserId ? ' (you)' : ''}
              </option>
            ))}
          </select>
          {errors.paid_by && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.paid_by.message}</p>
          )}
        </div>

        {/* Who received */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Paid to *
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm
                       focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500
                       dark:border-navy-600 dark:bg-navy-800 dark:text-gray-100
                       dark:focus:border-brand-400 dark:focus:ring-brand-400"
            {...register('paid_to')}
          >
            <option value="">Select person</option>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.display_name}
                {m.user_id === currentUserId ? ' (you)' : ''}
              </option>
            ))}
          </select>
          {errors.paid_to && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.paid_to.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount ($) *"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="50.00"
            error={errors.amount?.message}
            {...register('amount')}
          />
          <Input
            label="Note (optional)"
            placeholder="Venmo, cash..."
            error={errors.note?.message}
            {...register('note')}
          />
        </div>

        {createSettlement.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Failed to record payment. Please try again.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createSettlement.isPending}>
            Record Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
