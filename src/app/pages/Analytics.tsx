import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, DollarSign, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { useApp } from "../context/AppContext";

function useTooltipStyle(darkMode: boolean) {
  return {
    contentStyle: {
      backgroundColor: darkMode ? '#1F2937' : '#ffffff',
      border: darkMode ? '1px solid #374151' : '1px solid #E5E7EB',
      borderRadius: '8px',
      color: darkMode ? '#F9FAFB' : '#111827',
    },
    cursor: { fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
  };
}

const CATEGORY_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export function Analytics() {
  const { weeks, settings } = useApp();
  const { contentStyle, cursor } = useTooltipStyle(settings.darkMode);

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatMonthKey = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", { month: "short" });
  };

  const monthlyMap = new Map<string, number>();
  weeks.forEach((week) => {
    const monthKey = formatMonthKey(week.startDate);
    const totalWeekExpenses = week.expenses.reduce((sum, e) => sum + e.amount, 0);
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + totalWeekExpenses);
  });

  const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthlyData = Array.from(monthlyMap.entries())
    .map(([month, spending]) => ({ month, spending }))
    .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

  const weeklyComparison = weeks.map((week) => ({
    week: formatDate(week.startDate),
    income: week.income,
    expenses: week.expenses.reduce((sum, exp) => sum + exp.amount, 0),
  }));

  const categoryMap = new Map<string, number>();
  weeks.forEach((week) => {
    week.expenses.forEach((expense) => {
      categoryMap.set(expense.activity, (categoryMap.get(expense.activity) || 0) + expense.amount);
    });
  });

  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

  const trendData = weeks.map((week) => {
    const totalWeekExpenses = week.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return {
      week: formatDate(week.startDate),
      income: week.income,
      expenses: totalWeekExpenses,
      net: week.income - totalWeekExpenses,
    };
  });

  const totalIncome = weeks.reduce((sum, w) => sum + w.income, 0);
  const totalExpenses = weeks.reduce(
    (sum, w) => sum + w.expenses.reduce((s, e) => s + e.amount, 0),
    0
  );
  const avgWeeklySpending = weeks.length > 0 ? totalExpenses / weeks.length : 0;
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">Visualize your financial trends</p>
      </div>

      {weeks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 md:p-12 text-center">
          <BarChart3 className="w-12 h-12 md:w-16 md:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No data available</h3>
          <p className="text-gray-500 dark:text-gray-400">Create some weeks to see your analytics</p>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Income</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">${totalIncome.toFixed(2)}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">${totalExpenses.toFixed(2)}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Avg Weekly</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">${avgWeeklySpending.toFixed(2)}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                  <PieChartIcon className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Savings Rate</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{savingsRate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Monthly Spending</h3>
              <div style={{ width: "100%", height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={contentStyle} cursor={cursor} />
                    <Bar dataKey="spending" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Weekly Comparison</h3>
              <div style={{ width: "100%", height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={contentStyle} cursor={cursor} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Category Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Expense Categories</h3>
              {(() => {
                const total = categoryData.reduce((s, c) => s + c.value, 0);
                const main = categoryData.filter((c) => total > 0 && c.value / total >= 0.08);
                const othersValue = categoryData
                  .filter((c) => total === 0 || c.value / total < 0.08)
                  .reduce((s, c) => s + c.value, 0);
                const pieData = othersValue > 0 ? [...main, { name: "Others", value: othersValue }] : main;
                return (
                  <div style={{ width: "100%", height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.name === "Others" ? "#9CA3AF" : CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={contentStyle} cursor={cursor} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Income vs Expense Trend</h3>
              <div style={{ width: "100%", height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={contentStyle} cursor={cursor} />
                    <Legend />
                    <Bar dataKey="income" fill="#10B981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="expenses" fill="#EF4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Insights Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Key Insights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Top Spending Category</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {categoryData.length > 0
                    ? categoryData.reduce((max, cat) => (cat.value > max.value ? cat : max)).name
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Weeks Tracked</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{weeks.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Balance</p>
                <p className="text-lg font-semibold text-green-600">
                  ${(totalIncome - totalExpenses).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
