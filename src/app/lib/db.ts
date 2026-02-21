import { supabase } from "./supabase";

export type DbWeekRow = {
  id: string;
  start_date: string;
  end_date: string;
  initial_balance: number | string;
  income: number | string;
  created_at: string;
};

export type DbExpenseRow = {
  id: string;
  week_id: string;
  activity: string;
  amount: number | string;
  created_at: string;
};

export async function dbGetWeeks() {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("weeks")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DbWeekRow[];
}

export async function dbGetExpenses(weekId: string) {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("week_id", weekId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DbExpenseRow[];
}

export async function dbCreateWeek(payload: {
  start_date: string;
  end_date: string;
  initial_balance: number;
  income: number;
}) {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("weeks")
    .insert({ ...payload, user_id: userId })
    .select("*")
    .single();

  if (error) throw error;
  return data as DbWeekRow;
}

export async function dbUpdateWeekIncome(weekId: string, income: number) {
  const { data, error } = await supabase
    .from("weeks")
    .update({ income })
    .eq("id", weekId)
    .select("*")
    .single();

  if (error) throw error;
  return data as DbWeekRow;
}
export async function dbUpdateExpense(expenseId: string, payload: { activity: string; amount: number }) {
  const { data, error } = await supabase
    .from("expenses")
    .update(payload)
    .eq("id", expenseId)
    .select("*")
    .single();

  if (error) throw error;
  return data as DbExpenseRow;
}

export async function dbAddExpense(payload: {
  week_id: string;
  activity: string;
  amount: number;
}) {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("expenses")
    .insert({ ...payload, user_id: userId })
    .select("*")
    .single();

  if (error) throw error;
  return data as DbExpenseRow;
}

export async function dbDeleteExpense(expenseId: string) {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  if (error) throw error;
}

async function requireUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}