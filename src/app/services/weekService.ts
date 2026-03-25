import { supabase } from "../lib/supabase";
import {
  dbGetWeeks,
  dbGetAllExpenses,
  dbCreateWeek,
  dbUpdateWeekIncome,
  dbAddExpense,
  dbDeleteExpense,
  dbUpdateExpense,
} from "../lib/db";
import { mapExpenseRow, mapWeekRow } from "../lib/mappers";
import { Expense, Week } from "../types";

export async function recomputeChain(userId: string): Promise<void> {
  const { error } = await supabase.rpc("recompute_week_chain", { p_user: userId });
  if (error) throw error;
}

// Carga todas las semanas con sus gastos en 2 queries (antes era N+1)
export async function loadWeeks(): Promise<Week[]> {
  const [weekRows, expenseRows] = await Promise.all([
    dbGetWeeks(),
    dbGetAllExpenses(),
  ]);

  const expMap = new Map<string, ReturnType<typeof mapExpenseRow>[]>();
  for (const row of expenseRows) {
    const mapped = mapExpenseRow(row);
    const list = expMap.get(row.week_id) ?? [];
    list.push(mapped);
    expMap.set(row.week_id, list);
  }

  return weekRows.map((w) => mapWeekRow(w, expMap.get(w.id) ?? []));
}

export async function createWeek(
  startDate: string,
  endDate: string,
  initialBalance: number,
  income: number
): Promise<string> {
  const newWeek = await dbCreateWeek({
    start_date: startDate,
    end_date: endDate,
    initial_balance: Number(initialBalance.toFixed(2)),
    income,
  });
  return newWeek.id;
}

export async function removeWeek(id: string): Promise<void> {
  const { error } = await supabase.from("weeks").delete().eq("id", id);
  if (error) throw error;
}

export async function createExpense(
  weekId: string,
  activity: string,
  amount: number
): Promise<Expense> {
  const row = await dbAddExpense({ week_id: weekId, activity, amount, paid: false });
  return mapExpenseRow(row);
}

export async function removeExpense(expenseId: string): Promise<void> {
  await dbDeleteExpense(expenseId);
}

export async function patchExpense(
  expenseId: string,
  activity: string,
  amount: number
): Promise<void> {
  await dbUpdateExpense(expenseId, { activity, amount });
}

export async function patchExpensePaid(
  expenseId: string,
  paid: boolean
): Promise<void> {
  await dbUpdateExpense(expenseId, { paid });
}

export async function patchWeekIncome(weekId: string, income: number): Promise<void> {
  await dbUpdateWeekIncome(weekId, income);
}

export async function clearAllData(): Promise<void> {
  const { error } = await supabase
    .from("weeks")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw error;
}
