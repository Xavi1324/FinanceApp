import { useState } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AddWeekModal } from '../components/AddWeekModal';

export function Weeks() {
  const { weeks, addWeek, deleteWeek, setCurrentWeek } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d); // LOCAL (no UTC)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getWeekStats = (weekId: string) => {
    const week = weeks.find(w => w.id === weekId);
    if (!week) return { totalIncome: 0, totalExpenses: 0, remainingBalance: 0 };
    
    const totalExpenses = week.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remainingBalance = week.initialBalance + week.income - totalExpenses;
    
    return {
      totalIncome: week.income,
      totalExpenses,
      remainingBalance
    };
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Week Management
          </h1>
          <p className="text-gray-500">View and manage all your weekly budgets</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Create New Week
        </button>
      </div>

      {/* Weeks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weeks.map((week) => {
          const stats = getWeekStats(week.id);
          
          return (
            <div
              key={week.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
              onClick={() => {
                setCurrentWeek(week.id);
                window.location.href = '/';
              }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this week?')) {
                        deleteWeek(week.id);
                      }
                    }}
                    className="text-gray-400 hover:text-red-600 transition-colors p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {formatDate(week.startDate)}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  to {formatDate(week.endDate)}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Total Income</span>
                    <span className="text-sm font-semibold text-green-600">
                      +${stats.totalIncome.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Total Expenses</span>
                    <span className="text-sm font-semibold text-red-600">
                      -${stats.totalExpenses.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Remaining</span>
                    <span className="text-sm font-semibold text-blue-600">
                      ${stats.remainingBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {week.expenses.length} transaction{week.expenses.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {weeks.length === 0 && (
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No weeks yet</h3>
          <p className="text-gray-500 mb-6">Create your first week to start tracking expenses</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-5 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New Week
          </button>
        </div>
      )}

      {/* Modal */}
      <AddWeekModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addWeek}
      />
    </div>
  );
}
