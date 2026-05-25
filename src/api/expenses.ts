import { api } from '../lib/axios';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Split {
  user_id: string;
  display_name: string;
  amount: number;
}

export interface Expense {
  id: string;
  trip_id: string;
  paid_by: string;
  paid_by_name: string;
  description: string;
  amount: number;
  splits: Split[];
  created_at: string;
  updated_at: string;
}

export interface Balance {
  user_id: string;
  display_name: string;
  paid: number;
  owed: number;
  settled_out: number;
  settled_in: number;
  /** Positive → others owe them. Negative → they owe others. */
  net: number;
}

export interface Settlement {
  id: string;
  trip_id: string;
  paid_by: string;
  paid_by_name: string;
  paid_to: string;
  paid_to_name: string;
  amount: number;
  note: string | null;
  created_at: string;
}

// ── Request shapes ────────────────────────────────────────────────────────────

export interface CreateExpenseData {
  description: string;
  amount: number;
  paid_by?: string;
  split_with?: string[];
}

export interface UpdateExpenseData {
  description?: string;
  amount?: number;
  paid_by?: string;
  split_with?: string[];
}

export interface CreateSettlementData {
  paid_by?: string;
  paid_to: string;
  amount: number;
  note?: string;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const expensesApi = {
  listExpenses: (tripId: string) =>
    api.get<Expense[]>(`/trips/${tripId}/expenses`),

  createExpense: (tripId: string, data: CreateExpenseData) =>
    api.post<Expense>(`/trips/${tripId}/expenses`, data),

  updateExpense: (expenseId: string, data: UpdateExpenseData) =>
    api.put<Expense>(`/expenses/${expenseId}`, data),

  deleteExpense: (expenseId: string) =>
    api.delete(`/expenses/${expenseId}`),

  getBalances: (tripId: string) =>
    api.get<Balance[]>(`/trips/${tripId}/balances`),

  listSettlements: (tripId: string) =>
    api.get<Settlement[]>(`/trips/${tripId}/settlements`),

  createSettlement: (tripId: string, data: CreateSettlementData) =>
    api.post<Settlement>(`/trips/${tripId}/settlements`, data),

  deleteSettlement: (settlementId: string) =>
    api.delete(`/settlements/${settlementId}`),
};
