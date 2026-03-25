import { DbExpenseRow, DbWeekRow } from "./db";
import { Expense, Week } from "../types";

export function toNumber(v: number | string | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function mapExpenseRow(r: DbExpenseRow): Expense {
  return {
    id: r.id,
    activity: r.activity,
    amount: toNumber(r.amount),
    paid: r.paid ?? false,
  };
}

export function mapWeekRow(r: DbWeekRow, expenses: Expense[]): Week {
  return {
    id: r.id,
    startDate: r.start_date,
    endDate: r.end_date,
    initialBalance: toNumber(r.initial_balance),
    income: toNumber(r.income),
    expenses,
  };
}
