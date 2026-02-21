import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CATEGORY_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function Analytics() {
  const { weeks } = useApp();

  // Monthly spending data (simulated from weeks)
  const monthlyMap = new Map<string, number>();

  weeks.forEach(week => {
    const month = new Date(week.startDate).toLocaleDateString("en-US", { month: "short" });

    const totalExpenses = week.expenses.reduce((sum, e) => sum + e.amount, 0);

    const current = monthlyMap.get(month) || 0;
    monthlyMap.set(month, current + totalExpenses);
  });

  const monthlyData = Array.from(monthlyMap.entries()).map(([month, spending]) => ({
    month,
    spending
  }));

  // Weekly comparison data
  const weeklyComparison = weeks.map((week, index) => ({
    week: new Date(week.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    income: week.income,
    expenses: week.expenses.reduce((sum, exp) => sum + exp.amount, 0)
  }));

  // Category breakdown (aggregate all expenses by activity)
  const categoryMap = new Map<string, number>();
  weeks.forEach(week => {
    week.expenses.forEach(expense => {
      const current = categoryMap.get(expense.activity) || 0;
      categoryMap.set(expense.activity, current + expense.amount);
    });
  });

  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value
  }));

  // Income vs Expense trend
  const trendData = weeks.map((week, index) => {
    const totalExpenses = week.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return {
        week: new Date(week.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        income: week.income,
      expenses: totalExpenses,
      net: week.income - totalExpenses
    };
  });

  // Calculate total stats
  const totalIncome = weeks.reduce((sum, w) => sum + w.income, 0);
  const totalExpenses = weeks.reduce((sum, w) => sum + w.expenses.reduce((s, e) => s + e.amount, 0), 0);
  const avgWeeklySpending = weeks.length > 0 ? totalExpenses / weeks.length : 0;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Financial Analytics
        </h1>
        <p className="text-gray-500">Advanced insights into your spending patterns</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Total Income</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">${totalIncome.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Total Expenses</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">${totalExpenses.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Avg Weekly</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">${avgWeeklySpending.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <PieChartIcon className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Savings Rate</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{savingsRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Monthly Spending Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Spending</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Bar dataKey="spending" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Comparison Line Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Comparison</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="week" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Expense Categories</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income vs Expense Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Income vs Expense Trend</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="week" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Top Spending Category</p>
            <p className="text-lg font-semibold text-gray-900">
              {categoryData.length > 0 ? categoryData.reduce((max, cat) => cat.value > max.value ? cat : max).name : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Weeks Tracked</p>
            <p className="text-lg font-semibold text-gray-900">{weeks.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Net Balance</p>
            <p className="text-lg font-semibold text-green-600">
              ${(totalIncome - totalExpenses).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}