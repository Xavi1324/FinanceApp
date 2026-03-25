export interface Expense {
  id: string;
  activity: string;
  amount: number;
  paid: boolean;
}

export interface Week {
  id: string;
  startDate: string;  // "YYYY-MM-DD"
  endDate: string;    // "YYYY-MM-DD"
  initialBalance: number;
  income: number;
  expenses: Expense[];
}

export interface Settings {
  currency: string;
  darkMode: boolean;
  defaultWeeklyIncome: number;
}
