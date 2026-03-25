import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Trash2, Calendar } from "lucide-react";
import { useApp } from "../context/AppContext";
import { AddWeekModal } from "../components/AddWeekModal";
import { DeleteWeekModal } from "../components/DeleteWeekModal";

export function Weeks() {
  const { weeks, addWeek, deleteWeek, setCurrentWeek } = useApp();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [weekToDelete, setWeekToDelete] = useState<{
    id: string;
    startDate: string;
    endDate: string;
    expenseCount: number;
  } | null>(null);

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getWeekStats = (weekId: string) => {
    const week = weeks.find((w) => w.id === weekId);
    if (!week) return { totalIncome: 0, totalExpenses: 0, remainingBalance: 0 };

    const totalExpenses = week.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remainingBalance = week.initialBalance + week.income - totalExpenses;

    return {
      totalIncome: week.income,
      totalExpenses,
      remainingBalance,
    };
  };

  const handleOpenDeleteWeekModal = (week: {
    id: string;
    startDate: string;
    endDate: string;
    expenses: { amount: number }[];
  }) => {
    setWeekToDelete({
      id: week.id,
      startDate: week.startDate,
      endDate: week.endDate,
      expenseCount: week.expenses.length,
    });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteWeek = () => {
    if (!weekToDelete) return;
    deleteWeek(weekToDelete.id);
    setIsDeleteModalOpen(false);
    setWeekToDelete(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Weeks Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
          View and manage all your weekly budgets
        </p>
      </div>

      {weeks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 md:p-12 text-center">
          <Calendar className="w-12 h-12 md:w-16 md:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No weeks created yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Create your first week to start tracking your budget
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg mx-auto"
          >
            <Plus className="w-5 h-5" />
            Create first week
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Week
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {weeks.map((week) => {
              const stats = getWeekStats(week.id);

              return (
                <div
                  key={week.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                  onClick={() => {
                    setCurrentWeek(week.id);
                    navigate("/");
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDeleteWeekModal(week);
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {formatDate(week.startDate)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      to {formatDate(week.endDate)}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Income</span>
                        <span className="text-sm font-semibold text-green-600">
                          +${stats.totalIncome.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</span>
                        <span className="text-sm font-semibold text-red-600">
                          -${stats.totalExpenses.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Remaining</span>
                        <span className="text-sm font-semibold text-blue-600">
                          ${stats.remainingBalance.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {week.expenses.length} transaction{week.expenses.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <AddWeekModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addWeek}
        lastEndDate={weeks[weeks.length - 1]?.endDate}
      />

      <DeleteWeekModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setWeekToDelete(null);
        }}
        onConfirm={handleConfirmDeleteWeek}
        weekRange={
          weekToDelete
            ? `${formatDate(weekToDelete.startDate)} - ${formatDate(weekToDelete.endDate)}`
            : ""
        }
        expenseCount={weekToDelete?.expenseCount || 0}
      />
    </div>
  );
}
