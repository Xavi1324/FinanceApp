import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Expense } from '../context/AppContext';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: string, amount: number) => void;
  currentExpense?: Expense;
}

export function EditExpenseModal({ isOpen, onClose, onSave, currentExpense }: EditExpenseModalProps) {
  const [activity, setActivity] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (currentExpense) {
      setActivity(currentExpense.activity);
      setAmount(currentExpense.amount.toString());
    }
  }, [currentExpense]);

  if (!isOpen || !currentExpense) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activity && amount) {
      onSave(activity, parseFloat(amount));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Editar Gasto</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actividad
            </label>
            <input
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="Ej: Comida, Transporte, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}