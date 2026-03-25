import { useState, useEffect } from "react";
import { X, CalendarDays } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/app/components/ui/calendar";

interface AddWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (startDate: string, endDate: string) => void | Promise<void>;
  lastEndDate?: string;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function nextWeekFrom(endDateISO: string): DateRange {
  const end = toLocalDate(endDateISO);
  return { from: addDays(end, 1), to: addDays(end, 7) };
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function AddWeekModal({ isOpen, onClose, onSave, lastEndDate }: AddWeekModalProps) {
  const [range, setRange] = useState<DateRange | undefined>();

  useEffect(() => {
    if (isOpen) {
      setRange(lastEndDate ? nextWeekFrom(lastEndDate) : undefined);
    }
  }, [isOpen, lastEndDate]);

  if (!isOpen) return null;

  const isValid = !!range?.from && !!range?.to && range.to > range.from;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    await onSave(toISODate(range!.from!), toISODate(range!.to!));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add New Week</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center mb-4">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              defaultMonth={range?.from ?? new Date()}
              numberOfMonths={1}
            />
          </div>

          {/* Selected range summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3 mb-5 flex items-center gap-3 min-h-[48px]">
            <CalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
            {range?.from && range?.to ? (
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {formatDate(range.from)} → {formatDate(range.to)}
              </p>
            ) : range?.from ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(range.from)} → select end date
              </p>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">Select a start date</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Week
          </button>
        </form>
      </div>
    </div>
  );
}
