import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface EditIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (income: number) => void;
  currentIncome: number;
}

export function EditIncomeModal({ isOpen, onClose, onSave, currentIncome }: EditIncomeModalProps) {
  const [income, setIncome] = useState<string>('0.00');
  const [error, setError] = useState<string>('');

  // ✅ Cada vez que se abre el modal o cambia el income actual, sincroniza el input
  useEffect(() => {
    if (isOpen) {
      setIncome(Number(currentIncome).toFixed(2));
      setError('');
    }
  }, [isOpen, currentIncome]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const n = Number(income);

    // ✅ Validación fuerte
    if (!Number.isFinite(n)) {
      setError('Ingresa un número válido');
      return;
    }
    if (n < 0) {
      setError('El ingreso no puede ser negativo');
      return;
    }

    onSave(Number(n.toFixed(2)));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Editar Ingreso</h2>
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
              Ingreso Semanal
            </label>

            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={income}
                onChange={(e) => {
                  setIncome(e.target.value);
                  setError('');
                }}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
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