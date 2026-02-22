import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import {
  dbAddExpense,
  dbCreateWeek,
  dbDeleteExpense,
  dbGetExpenses,
  dbGetWeeks,
  dbUpdateWeekIncome,
  DbExpenseRow,
  DbWeekRow,
  dbUpdateExpense,
} from "../lib/db";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

export interface Expense {
  id: string;
  activity: string;
  amount: number;
}

export interface Week {
  id: string;
  startDate: string;   // "YYYY-MM-DD"
  endDate: string;     // "YYYY-MM-DD"
  initialBalance: number;
  income: number;
  expenses: Expense[];
}

interface Settings {
  currency: string;
  darkMode: boolean;
  defaultWeeklyIncome: number;
}

interface AppContextType {
  weeks: Week[];
  currentWeekId: string | null;
  settings: Settings;

  // Actions
  addWeek: (startDate: string, endDate: string) => Promise<void>;
  deleteWeek: (id: string) => Promise<void>;
  setCurrentWeek: (id: string) => void;

  addExpense: (weekId: string, activity: string, amount: number) => Promise<void>;
  deleteExpense: (weekId: string, expenseId: string) => Promise<void>;

  updateWeekIncome: (weekId: string, income: number) => Promise<void>;
  updateExpense: (expenseId: string, activity: string, amount: number) => Promise<void>;

  updateSettings: (settings: Partial<Settings>) => void;
  resetAllData: () => Promise<void>;

  // helpers
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSettings: Settings = {
  currency: "USD",
  darkMode: false,
  defaultWeeklyIncome: 500,
};

function toNumber(v: number | string | null | undefined) {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function mapExpenseRow(r: DbExpenseRow): Expense {
  return {
    id: r.id,
    activity: r.activity,
    amount: toNumber(r.amount),
  };
}

function mapWeekRow(r: DbWeekRow, expenses: Expense[]): Week {
  return {
    id: r.id,
    startDate: r.start_date,
    endDate: r.end_date,
    initialBalance: toNumber(r.initial_balance),
    income: toNumber(r.income),
    expenses,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [currentWeekId, setCurrentWeekId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  const currentWeek = useMemo(
    () => weeks.find((w) => w.id === currentWeekId) ?? (weeks.length ? weeks[0] : null),
    [weeks, currentWeekId]
  );

  const getWeekTotals = (week: Week) => {
    const totalExpenses = week.expenses.reduce((sum, e) => sum + e.amount, 0);
    const currentBalance = week.initialBalance + week.income;
    const remainingBalance = currentBalance - totalExpenses;
    return { totalExpenses, currentBalance, remainingBalance };
  };
  const updateExpense = async (expenseId: string, activity: string, amount: number) => {
    try {
      await dbUpdateExpense(expenseId, { activity, amount });
      await recomputeChain();
      await refresh();
    } catch (e) {
      console.error("updateExpense error:", e);
      alert("Error updating expense. Check console.");
    }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid) { // si ya no hay sesión, no sigas
        setWeeks([]);
        setCurrentWeekId(null);
        return;
      }


      const weekRows = await dbGetWeeks();
      // Traer expenses por cada week (MVP simple)
      const mapped: Week[] = [];
      for (const w of weekRows) {
        const expRows = await dbGetExpenses(w.id);
        const exps = expRows.map(mapExpenseRow);
        mapped.push(mapWeekRow(w, exps));
      }

      setWeeks(mapped);

      // Selección inicial
      if (mapped.length === 0) {
        setCurrentWeekId(null);
      } else if (!currentWeekId || !mapped.some((w) => w.id === currentWeekId)) {
        setCurrentWeekId(mapped[mapped.length - 1].id); // última creada
      }
    } catch (e) {
      console.error("refresh error:", e);
    } finally {
      setLoading(false);
    }
  };
  const recomputeChain = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;

    const uid = data.user?.id;
    if (!uid) return;

    const { error: rpcError } = await supabase.rpc("recompute_week_chain", { p_user: uid });
    if (rpcError) throw rpcError;
  };


  useEffect(() => {
    // Espera a que el AuthContext termine de resolver si hay sesión o no
    if (authLoading) return;

    // Si no hay usuario (logout) => limpia estado
    if (!userId) {
      setWeeks([]);
      setCurrentWeekId(null);
      setLoading(false);
      return;
    }

    // Si hay usuario (login / cambio de usuario) => carga data
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, authLoading]);

  const addWeek = async (startDate: string, endDate: string) => {
    try {
      // Usar remaining de la semana actual (si existe) como initial_balance
      const initialFromPrev = currentWeek ? getWeekTotals(currentWeek).remainingBalance : 0;

      const newWeek = await dbCreateWeek({
        start_date: startDate,
        end_date: endDate,
        initial_balance: Number(initialFromPrev.toFixed(2)),
        income: settings.defaultWeeklyIncome,
      });
      await recomputeChain();
      await refresh();
      setCurrentWeekId(newWeek.id);
    } catch (e) {
      console.error("addWeek error:", e);
      alert("Error creating week. Check console.");
    }
  };

  const deleteWeek = async (id: string) => {
    try {
      // Borrar week (cascade borra expenses)
      const { error } = await supabase.from("weeks").delete().eq("id", id);
      if (error) throw error;

      // refrescar y arreglar selección
      await recomputeChain();
      await refresh();
    } catch (e) {
      console.error("deleteWeek error:", e);
      alert("Error deleting week. Check console.");
    }
  };

  const setCurrentWeek = (id: string) => setCurrentWeekId(id);

  const addExpense = async (weekId: string, activity: string, amount: number) => {
    try {
      await dbAddExpense({ week_id: weekId, activity, amount });
      await recomputeChain();
      await refresh();
      setCurrentWeekId(weekId);
    } catch (e) {
      console.error("addExpense error:", e);
      alert("Error adding expense. Check console.");
    }
  };

  const deleteExpense = async (_weekId: string, expenseId: string) => {
    try {
      await dbDeleteExpense(expenseId);
      await recomputeChain();
      await refresh();
    } catch (e) {
      console.error("deleteExpense error:", e);
      alert("Error deleting expense. Check console.");
    }
  };

  const updateWeekIncome = async (weekId: string, income: number) => {
    try {
      await dbUpdateWeekIncome(weekId, income);
      await recomputeChain();
      await refresh();
      setCurrentWeekId(weekId);
    } catch (e) {
      console.error("updateWeekIncome error:", e);
      alert("Error updating income. Check console.");
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetAllData = async () => {
    // ⚠️ Esto borra TODO. Útil para dev.
    const ok = window.confirm("This will DELETE all weeks & expenses in Supabase. Continue?");
    if (!ok) return;

    try {
      // delete weeks => cascade expenses
      const { error } = await supabase.from("weeks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;

      await recomputeChain();
      await refresh();
    } catch (e) {
      console.error("resetAllData error:", e);
      alert("Error resetting data. Check console.");
    }
  };

  return (
    <AppContext.Provider
      value={{
        weeks,
        currentWeekId,
        settings,
        addWeek,
        deleteWeek,
        setCurrentWeek,
        addExpense,
        deleteExpense,
        updateWeekIncome,
        updateExpense,
        updateSettings,
        resetAllData,
        refresh,
      }}
    >
      {/* opcional: puedes mostrar loading */}
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}