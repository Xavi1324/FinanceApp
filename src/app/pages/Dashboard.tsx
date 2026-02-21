import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Plus, ChevronDown, Trash2, Edit2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AddWeekModal } from '../components/AddWeekModal';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { EditIncomeModal } from '../components/EditIncomeModal';
import { EditExpenseModal } from '../components/EditExpenseModal';

const COLORS = ['#EF4444', '#E5E7EB'];

export function Dashboard() {
  const { weeks, currentWeekId, setCurrentWeek, addWeek, addExpense, deleteExpense, updateWeekIncome,updateExpense } = useApp();
  const [isWeekModalOpen, setIsWeekModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState('');

  const currentWeek = weeks.find(w => w.id === currentWeekId) || weeks[0];
  
  if (!currentWeek) {
    return <div className="p-8">No weeks available</div>;
  }

  const totalExpenses = currentWeek.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBalance = currentWeek.initialBalance + currentWeek.income - totalExpenses;
  const percentageSpent = ((totalExpenses / currentWeek.income) * 100).toFixed(1);

  const chartData = [
    { name: 'Spent', value: totalExpenses },
    { name: 'Remaining', value: Math.max(0, remainingBalance) }
  ];

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d); // LOCAL (no UTC)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleDeleteExpense = (expenseId: string, activity: string, amount: number) => {
    if (window.confirm(`¿Estás seguro que deseas eliminar este gasto?\n\nGasto: ${activity}\nCantidad: $${amount.toFixed(2)}`)) {
      deleteExpense(currentWeek.id, expenseId);
    }
  };

  const handleEditExpense = (expenseId: string) => {
    setSelectedExpenseId(expenseId);
    setIsEditExpenseModalOpen(true);
  };
  

  return (
    <div className="p-8">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Weekly Budget Overview
          </h1>
          <p className="text-gray-500">Manage your weekly finances</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Week Selector */}
          <div className="relative">
            <select
              value={currentWeekId || ''}
              onChange={(e) => setCurrentWeek(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-3 font-medium text-gray-900 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              {weeks.map(week => (
                <option key={week.id} value={week.id}>
                  {formatDate(week.startDate)} – {formatDate(week.endDate)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          </div>

          {/* Add Week Button */}
          <button
            onClick={() => setIsWeekModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Week
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-8">
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-6">
            {/* Card 1: Initial Balance */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">Initial Balance</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${currentWeek.initialBalance.toFixed(2)}
              </p>
            </div>

            {/* Card 2: Income */}
            <div className="bg-white rounded-xl p-6 shadow-sm relative">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <button
                  onClick={() => setIsIncomeModalOpen(true)}
                  className="text-gray-400 hover:text-green-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-1">Income</p>
              <p className="text-2xl font-semibold text-green-600">
                +${currentWeek.income.toFixed(2)}
              </p>
            </div>

            {/* Card 3: Total Expenses */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">Total Weekly Expenses</p>
              <p className="text-2xl font-semibold text-red-600">
                -${totalExpenses.toFixed(2)}
              </p>
            </div>

            {/* Card 4: Remaining Balance (Highlighted) */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-sm text-blue-100 mb-1">Remaining Balance</p>
              <p className="text-2xl font-semibold text-white">
                ${remainingBalance.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Expense Breakdown</h2>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Activity</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Amount</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentWeek.expenses.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        No expenses yet. Click "Add Expense" to get started.
                      </td>
                    </tr>
                  ) : (
                    currentWeek.expenses.map((expense, index) => (
                      <tr
                        key={expense.id}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        <td className="px-6 py-4 text-gray-900">{expense.activity}</td>
                        <td className="px-6 py-4 text-right text-gray-900 font-medium">
                          ${expense.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleEditExpense(expense.id)}
                            className="text-blue-500 hover:text-blue-600 mr-2"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id, expense.activity, expense.amount)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {currentWeek.expenses.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">Total</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        ${totalExpenses.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Donut Chart Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending Overview</h3>
            <div className="mb-6" style={{ width: '100%', height: '192px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600">Spent</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  ${chartData[0].value.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="text-sm text-gray-600">Remaining</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  ${chartData[1].value.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Usage</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Percentage Used</span>
                <span className="text-2xl font-semibold text-gray-900">{percentageSpent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(parseFloat(percentageSpent), 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                You've used {percentageSpent}% of your weekly income of ${currentWeek.income.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Largest Expense</span>
                <span className="text-sm font-medium text-gray-900">
                  {currentWeek.expenses.length > 0
                    ? `${currentWeek.expenses.reduce((max, exp) => exp.amount > max.amount ? exp : max).activity} ($${currentWeek.expenses.reduce((max, exp) => exp.amount > max.amount ? exp : max).amount.toFixed(2)})`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Transactions</span>
                <span className="text-sm font-medium text-gray-900">{currentWeek.expenses.length}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Average per Day</span>
                <span className="text-sm font-medium text-gray-900">
                  ${(totalExpenses / 7).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddWeekModal
        isOpen={isWeekModalOpen}
        onClose={() => setIsWeekModalOpen(false)}
        onSave={addWeek}
      />
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={(activity, amount) => addExpense(currentWeek.id, activity, amount)}
      />
      <EditIncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        onSave={(income) => updateWeekIncome(currentWeek.id, income)}
        currentIncome={currentWeek.income}
      />
      <EditExpenseModal
        isOpen={isEditExpenseModalOpen}
        onClose={() => setIsEditExpenseModalOpen(false)}
        onSave={(activity, amount) => updateExpense(selectedExpenseId, activity, amount)}
        currentExpense={currentWeek.expenses.find(exp => exp.id === selectedExpenseId)}
      />
    </div>
  );
}