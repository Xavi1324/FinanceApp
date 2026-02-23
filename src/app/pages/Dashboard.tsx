import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Plus,
  ChevronDown,
  Trash2,
  Edit2,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { AddWeekModal } from "../components/AddWeekModal";
import { AddExpenseModal } from "../components/AddExpenseModal";
import { EditIncomeModal } from "../components/EditIncomeModal";
import { EditExpenseModal } from "../components/EditExpenseModal";
import { DeleteExpenseModal } from "../components/DeleteExpenseModal"; // ✅ NEW

const COLORS = ["#EF4444", "#E5E7EB"];

export function Dashboard() {
  const {
    weeks,
    currentWeekId,
    setCurrentWeek,
    addWeek,
    addExpense,
    deleteExpense,
    updateWeekIncome,
    toggleExpensePaid,
    updateExpense,
  } = useApp();

  const [isWeekModalOpen, setIsWeekModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);

  // ✅ Delete modal state
  const [isDeleteExpenseModalOpen, setIsDeleteExpenseModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<{
    id: string;
    activity: string;
    amount: number;
  } | null>(null);

  const [selectedExpenseId, setSelectedExpenseId] = useState("");

  // ✅ puede ser null si no hay weeks
  const currentWeek = weeks.find((w) => w.id === currentWeekId) ?? weeks[0] ?? null;

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d); // LOCAL (no UTC)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // ✅ ahora abre modal en vez de window.confirm
  const handleDeleteExpense = (expenseId: string, activity: string, amount: number) => {
    setExpenseToDelete({ id: expenseId, activity, amount });
    setIsDeleteExpenseModalOpen(true);
  };

  const handleEditExpense = (expenseId: string) => {
    setSelectedExpenseId(expenseId);
    setIsEditExpenseModalOpen(true);
  };

  // ✅ si hay week, calculamos stats; si no, valores default
  const totalExpenses = currentWeek
    ? currentWeek.expenses.reduce((sum, exp) => sum + exp.amount, 0)
    : 0;

  const remainingBalance = currentWeek
    ? currentWeek.initialBalance + currentWeek.income - totalExpenses
    : 0;

  const percentageSpent = currentWeek
    ? ((totalExpenses / (currentWeek.income || 1)) * 100).toFixed(1)
    : "0.0";

  const chartData = currentWeek
    ? [
        { name: "Spent", value: totalExpenses },
        { name: "Remaining", value: Math.max(0, remainingBalance) },
      ]
    : [
        { name: "Spent", value: 0 },
        { name: "Remaining", value: 0 },
      ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* ✅ Top Controls SIEMPRE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
            Weekly Budget Overview
          </h1>
          <p className="text-gray-500 text-sm md:text-base">Manage your weekly finances</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* ✅ Week Selector solo si hay weeks */}
          {weeks.length > 0 && (
            <div className="relative">
              <select
                value={currentWeekId || weeks[0]?.id || ""}
                onChange={(e) => setCurrentWeek(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-3 font-medium text-gray-900 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer w-full sm:w-auto"
              >
                {weeks.map((week) => (
                  <option key={week.id} value={week.id}>
                    {formatDate(week.startDate)} – {formatDate(week.endDate)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>
          )}

          {/* ✅ Add Week siempre visible */}
          <button
            onClick={() => setIsWeekModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">
              {weeks.length === 0 ? "Create first week" : "Add Week"}
            </span>
            <span className="sm:hidden">{weeks.length === 0 ? "Create" : "Add"}</span>
          </button>
        </div>
      </div>

      {/* ✅ Empty State si no hay weeks */}
      {!currentWeek ? (
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 text-center">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No weeks yet</h3>
          <p className="text-gray-500">
            Click <span className="font-medium text-gray-900">Create first week</span> to
            start tracking your budget.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 lg:gap-8">
            <div className="space-y-6 lg:space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
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

                {/* Card 4: Remaining Balance */}
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
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 w-12">
                          Paid
                        </th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                          Activity
                        </th>
                        <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">
                          Amount
                        </th>
                        <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentWeek.expenses.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                            No expenses yet. Click "Add Expense" to get started.
                          </td>
                        </tr>
                      ) : (
                        currentWeek.expenses.map((expense, index) => (
                          <tr
                            key={expense.id}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} ${expense.paid ? "opacity-60" : ""}`}
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={expense.paid}
                                onChange={() => toggleExpensePaid(currentWeek.id, expense.id)}
                                className="w-5 h-5 text-green-500 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                              />
                            </td>

                            <td className={`px-6 py-4 text-gray-900 ${expense.paid ? "line-through" : ""}`}>
                              {expense.activity}
                            </td>

                            <td className={`px-6 py-4 text-right text-gray-900 font-medium ${expense.paid ? "line-through" : ""}`}>
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
                          <td className="px-6 py-4 font-semibold text-gray-900" colSpan={2}>
                            Total
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900">
                            ${totalExpenses.toFixed(2)}
                          </td>
                          <td />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Donut Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending Overview</h3>
                <div className="mb-6" style={{ width: "100%", height: "192px" }}>
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
                        {chartData.map((_, index) => (
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

              {/* Progress */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Usage</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Percentage Used</span>
                    <span className="text-2xl font-semibold text-gray-900">
                      {percentageSpent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(parseFloat(percentageSpent), 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    You've used {percentageSpent}% of your weekly income of $
                    {currentWeek.income.toFixed(2)}
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
                        ? `${
                            currentWeek.expenses.reduce((max, exp) =>
                              exp.amount > max.amount ? exp : max
                            ).activity
                          } ($${
                            currentWeek.expenses
                              .reduce((max, exp) => (exp.amount > max.amount ? exp : max))
                              .amount.toFixed(2)
                          })`
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Total Transactions</span>
                    <span className="text-sm font-medium text-gray-900">
                      {currentWeek.expenses.length}
                    </span>
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

          {/* Modals que dependen de currentWeek */}
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
            currentExpense={currentWeek.expenses.find((exp) => exp.id === selectedExpenseId)}
          />

          {/* ✅ DeleteExpenseModal */}
          <DeleteExpenseModal
            isOpen={isDeleteExpenseModalOpen}
            onClose={() => {
              setIsDeleteExpenseModalOpen(false);
              setExpenseToDelete(null);
            }}
            onConfirm={() => {
              if (!currentWeek || !expenseToDelete) return;
              deleteExpense(currentWeek.id, expenseToDelete.id);
              setIsDeleteExpenseModalOpen(false);
              setExpenseToDelete(null);
            }}
            expenseName={expenseToDelete?.activity || ""}
            expenseAmount={expenseToDelete?.amount || 0}
          />
        </>
      )}

      {/* ✅ AddWeekModal siempre disponible */}
      <AddWeekModal
        isOpen={isWeekModalOpen}
        onClose={() => setIsWeekModalOpen(false)}
        onSave={addWeek}
      />
    </div>
  );
}