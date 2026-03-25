import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { Week, Settings } from "../types";
import {
  recomputeChain,
  loadWeeks,
  createWeek,
  removeWeek,
  createExpense,
  removeExpense,
  patchExpense,
  patchExpensePaid,
  patchWeekIncome,
  clearAllData,
} from "../services/weekService";

// Re-exportar tipos para no romper imports existentes
export type { Expense, Week, Settings } from "../types";

interface AppContextType {
  weeks: Week[];
  currentWeekId: string | null;
  settings: Settings;

  addWeek: (startDate: string, endDate: string) => Promise<void>;
  deleteWeek: (id: string) => Promise<void>;
  setCurrentWeek: (id: string) => void;

  addExpense: (weekId: string, activity: string, amount: number) => Promise<void>;
  deleteExpense: (weekId: string, expenseId: string) => Promise<void>;
  toggleExpensePaid: (weekId: string, expenseId: string) => Promise<void>;

  updateWeekIncome: (weekId: string, income: number) => Promise<void>;
  updateExpense: (expenseId: string, activity: string, amount: number) => Promise<void>;

  updateSettings: (settings: Partial<Settings>) => void;
  resetAllData: () => Promise<void>;

  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSettings: Settings = {
  currency: "USD",
  darkMode: false,
  defaultWeeklyIncome: 500,
};

const SETTINGS_KEY = "financeapp-settings";

function loadSettings(): Settings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [currentWeekId, setCurrentWeekId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (userId && settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [userId, settings.darkMode]);

  const currentWeek = useMemo(
    () => weeks.find((w) => w.id === currentWeekId) ?? (weeks.length ? weeks[0] : null),
    [weeks, currentWeekId]
  );

  const getWeekRemainingBalance = (week: Week) => {
    const totalExpenses = week.expenses.reduce((sum, e) => sum + e.amount, 0);
    return week.initialBalance + week.income - totalExpenses;
  };

  const refresh = async () => {
    try {
      const mapped = await loadWeeks();
      setWeeks(mapped);
      if (mapped.length === 0) {
        setCurrentWeekId(null);
      } else if (!currentWeekId || !mapped.some((w) => w.id === currentWeekId)) {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const todayWeek = mapped.find((w) => w.startDate <= todayStr && w.endDate >= todayStr);
        setCurrentWeekId(todayWeek?.id ?? mapped[mapped.length - 1].id);
      }
    } catch (e) {
      console.error("refresh error:", e);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      setWeeks([]);
      setCurrentWeekId(null);
      return;
    }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, authLoading]);

  const addWeek = async (startDate: string, endDate: string) => {
    try {
      const initialBalance = currentWeek ? getWeekRemainingBalance(currentWeek) : 0;
      const newWeekId = await createWeek(startDate, endDate, initialBalance, settings.defaultWeeklyIncome);
      await recomputeChain(userId!);
      await refresh();
      setCurrentWeekId(newWeekId);
    } catch (e) {
      console.error("addWeek error:", e);
      alert("Error creating week. Check console.");
    }
  };

  const deleteWeek = async (id: string) => {
    try {
      await removeWeek(id);
      await recomputeChain(userId!);
      await refresh();
    } catch (e) {
      console.error("deleteWeek error:", e);
      alert("Error deleting week. Check console.");
    }
  };

  const addExpense = async (weekId: string, activity: string, amount: number) => {
    const tempId = `temp-${Date.now()}`;
    setWeeks((prev) =>
      prev.map((w) =>
        w.id !== weekId ? w : { ...w, expenses: [...w.expenses, { id: tempId, activity, amount, paid: false }] }
      )
    );
    setCurrentWeekId(weekId);

    try {
      const savedExpense = await createExpense(weekId, activity, amount);
      setWeeks((prev) =>
        prev.map((w) =>
          w.id !== weekId ? w : { ...w, expenses: w.expenses.map((e) => (e.id === tempId ? savedExpense : e)) }
        )
      );
      recomputeChain(userId!).catch(console.error);
    } catch (e) {
      console.error("addExpense error:", e);
      setWeeks((prev) =>
        prev.map((w) =>
          w.id !== weekId ? w : { ...w, expenses: w.expenses.filter((e) => e.id !== tempId) }
        )
      );
      alert("Error adding expense. Check console.");
    }
  };

  const deleteExpense = async (_weekId: string, expenseId: string) => {
    const weekWithExpense = weeks.find((w) => w.expenses.some((e) => e.id === expenseId));
    const expenseToRemove = weekWithExpense?.expenses.find((e) => e.id === expenseId);

    setWeeks((prev) =>
      prev.map((w) => ({ ...w, expenses: w.expenses.filter((e) => e.id !== expenseId) }))
    );

    try {
      await removeExpense(expenseId);
      recomputeChain(userId!).catch(console.error);
    } catch (e) {
      console.error("deleteExpense error:", e);
      if (weekWithExpense && expenseToRemove) {
        const exp = expenseToRemove;
        setWeeks((prev) =>
          prev.map((w) =>
            w.id !== weekWithExpense.id ? w : { ...w, expenses: [...w.expenses, exp] }
          )
        );
      }
      alert("Error deleting expense. Check console.");
    }
  };

  const toggleExpensePaid = async (weekId: string, expenseId: string) => {
    // Optimistic update
    setWeeks((prev) =>
      prev.map((w) =>
        w.id !== weekId
          ? w
          : { ...w, expenses: w.expenses.map((e) => (e.id === expenseId ? { ...e, paid: !e.paid } : e)) }
      )
    );

    try {
      const week = weeks.find((w) => w.id === weekId);
      const exp = week?.expenses.find((e) => e.id === expenseId);
      const newPaid = !(exp?.paid ?? false);
      await patchExpensePaid(expenseId, newPaid);
    } catch (e) {
      console.error("toggleExpensePaid error:", e);
      // Rollback
      setWeeks((prev) =>
        prev.map((w) =>
          w.id !== weekId
            ? w
            : { ...w, expenses: w.expenses.map((e) => (e.id === expenseId ? { ...e, paid: !e.paid } : e)) }
        )
      );
      alert("Error updating paid status.");
    }
  };

  const updateWeekIncome = async (weekId: string, income: number) => {
    const originalIncome = weeks.find((w) => w.id === weekId)?.income;

    setWeeks((prev) => prev.map((w) => (w.id !== weekId ? w : { ...w, income })));
    setCurrentWeekId(weekId);

    try {
      await patchWeekIncome(weekId, income);
      recomputeChain(userId!).then(() => refresh()).catch(console.error);
    } catch (e) {
      console.error("updateWeekIncome error:", e);
      if (originalIncome !== undefined) {
        setWeeks((prev) => prev.map((w) => (w.id !== weekId ? w : { ...w, income: originalIncome })));
      }
      alert("Error updating income. Check console.");
    }
  };

  const updateExpense = async (expenseId: string, activity: string, amount: number) => {
    const originalExpense = weeks.flatMap((w) => w.expenses).find((e) => e.id === expenseId);

    setWeeks((prev) =>
      prev.map((w) => ({
        ...w,
        expenses: w.expenses.map((e) => (e.id === expenseId ? { ...e, activity, amount } : e)),
      }))
    );

    try {
      await patchExpense(expenseId, activity, amount);
      recomputeChain(userId!).catch(console.error);
    } catch (e) {
      console.error("updateExpense error:", e);
      if (originalExpense) {
        const orig = originalExpense;
        setWeeks((prev) =>
          prev.map((w) => ({
            ...w,
            expenses: w.expenses.map((e) => (e.id === expenseId ? orig : e)),
          }))
        );
      }
      alert("Error updating expense. Check console.");
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const resetAllData = async () => {
    const ok = window.confirm("This will DELETE all weeks & expenses in Supabase. Continue?");
    if (!ok) return;
    try {
      await clearAllData();
      await recomputeChain(userId!);
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
        setCurrentWeek: setCurrentWeekId,
        addExpense,
        deleteExpense,
        updateWeekIncome,
        updateExpense,
        updateSettings,
        toggleExpensePaid,
        resetAllData,
        refresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
