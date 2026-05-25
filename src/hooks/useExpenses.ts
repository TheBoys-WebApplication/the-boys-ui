import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  expensesApi,
  CreateExpenseData,
  UpdateExpenseData,
  CreateSettlementData,
} from '../api/expenses';

// ── Expense queries ───────────────────────────────────────────────────────────

export function useExpenses(tripId: string) {
  return useQuery({
    queryKey: ['trips', tripId, 'expenses'],
    queryFn: () => expensesApi.listExpenses(tripId).then((r) => r.data),
    enabled: !!tripId,
  });
}

// ── Expense mutations ─────────────────────────────────────────────────────────

export function useCreateExpense(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseData) =>
      expensesApi.createExpense(tripId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips', tripId, 'expenses'] });
      qc.invalidateQueries({ queryKey: ['trips', tripId, 'balances'] });
    },
  });
}

export function useUpdateExpense(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId, data }: { expenseId: string; data: UpdateExpenseData }) =>
      expensesApi.updateExpense(expenseId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips', tripId, 'expenses'] });
      qc.invalidateQueries({ queryKey: ['trips', tripId, 'balances'] });
    },
  });
}

export function useDeleteExpense(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => expensesApi.deleteExpense(expenseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips', tripId, 'expenses'] });
      qc.invalidateQueries({ queryKey: ['trips', tripId, 'balances'] });
    },
  });
}

// ── Balance query ─────────────────────────────────────────────────────────────

export function useBalances(tripId: string) {
  return useQuery({
    queryKey: ['trips', tripId, 'balances'],
    queryFn: () => expensesApi.getBalances(tripId).then((r) => r.data),
    enabled: !!tripId,
  });
}

// ── Settlement queries ────────────────────────────────────────────────────────

export function useSettlements(tripId: string) {
  return useQuery({
    queryKey: ['trips', tripId, 'settlements'],
    queryFn: () => expensesApi.listSettlements(tripId).then((r) => r.data),
    enabled: !!tripId,
  });
}

export function useCreateSettlement(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSettlementData) =>
      expensesApi.createSettlement(tripId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips', tripId, 'settlements'] });
      qc.invalidateQueries({ queryKey: ['trips', tripId, 'balances'] });
    },
  });
}

export function useDeleteSettlement(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settlementId: string) => expensesApi.deleteSettlement(settlementId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips', tripId, 'settlements'] });
      qc.invalidateQueries({ queryKey: ['trips', tripId, 'balances'] });
    },
  });
}
