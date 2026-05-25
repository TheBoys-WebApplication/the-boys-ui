import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useCreateExpense, useUpdateExpense } from '../hooks/useExpenses';
import { useGroupMembers } from '../hooks/useGroups';
import { Expense } from '../api/expenses';
import { cn } from '../lib/utils';

const schema = z.object({
  description: z.string().min(1, 'Description is required').max(200),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
      message: 'Must be greater than zero',
    }),
  paid_by: z.string().min(1, 'Select who paid'),
  split_with: z.array(z.string()).min(1, 'Select at least one person to split with'),
});

type FormValues = z.infer<typeof schema>;

interface AddExpenseModalProps {
  tripId: string;
  groupId: string;
  currentUserId: string;
  /** Pass an existing expense to switch to edit mode. */
  expense?: Expense;
  open: boolean;
  onClose: () => void;
}

export default function AddExpenseModal({
  tripId,
  groupId,
  currentUserId,
  expense,
  open,
  onClose,
}: AddExpenseModalProps) {
  const isEditing = !!expense;

  const { data: members = [] } = useGroupMembers(groupId);
  const createExpense = useCreateExpense(tripId);
  const updateExpense = useUpdateExpense(tripId);
  const mutation = isEditing ? updateExpense : createExpense;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const splitWith = watch('split_with') ?? [];

  // Pre-fill defaults / edit values when modal opens.
  useEffect(() => {
    if (!open) {
      reset({});
      return;
    }
    if (isEditing && expense) {
      reset({
        description: expense.description,
        amount: String(expense.amount),
        paid_by: expense.paid_by,
        split_with: expense.splits.map((s) => s.user_id),
      });
    } else {
      reset({
        description: '',
        amount: '',
        paid_by: currentUserId,
        split_with: members.map((m) => m.user_id),
      });
    }
  }, [open, isEditing, expense, currentUserId, members, reset]);

  const handleClose = () => {
    reset({});
    mutation.reset();
    onClose();
  };

  const toggleSplit = (userId: string) => {
    const current = splitWith;
    if (current.includes(userId)) {
      setValue('split_with', current.filter((id) => id !== userId), { shouldValidate: true });
    } else {
      setValue('split_with', [...current, userId], { shouldValidate: true });
    }
  };

  const onSubmit = async (values: FormValues) => {
    const payload = {
      description: values.description,
      amount: Number(values.amount),
      paid_by: values.paid_by,
      split_with: values.split_with,
    };

    if (isEditing && expense) {
      await updateExpense.mutateAsync({ expenseId: expense.id, data: payload });
    } else {
      await createExpense.mutateAsync(payload);
    }
    handleClose();
  };

  // Per-person preview.
  const perPerson =
    splitWith.length > 0 && watch('amount') && !isNaN(Number(watch('amount')))
      ? (Number(watch('amount')) / splitWith.length).toFixed(2)
      : null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? 'Edit Expense' : 'Add Expense'}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Description *"
          placeholder="Airbnb, dinner, fuel..."
          error={errors.description?.message}
          {...register('description')}
        />

        <Input
          label="Total amount ($) *"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="150.00"
          error={errors.amount?.message}
          {...register('amount')}
        />

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

        {/* Split with */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Split with *
            </label>
            {perPerson && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ${perPerson} / person
              </span>
            )}
          </div>
          <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 dark:border-navy-600 dark:divide-navy-700">
            {members.map((m) => {
              const checked = splitWith.includes(m.user_id);
              return (
                <label
                  key={m.user_id}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors',
                    'hover:bg-gray-50 dark:hover:bg-navy-700',
                    'first:rounded-t-lg last:rounded-b-lg',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSplit(m.user_id)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-navy-500"
                  />
                  <span className="flex-1 text-gray-800 dark:text-gray-200">
                    {m.display_name}
                    {m.user_id === currentUserId ? ' (you)' : ''}
                  </span>
                </label>
              );
            })}
          </div>
          {errors.split_with && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.split_with.message}</p>
          )}
        </div>

        {mutation.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {isEditing ? 'Failed to save changes.' : 'Failed to add expense.'} Please try again.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {isEditing ? 'Save Changes' : 'Add Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
