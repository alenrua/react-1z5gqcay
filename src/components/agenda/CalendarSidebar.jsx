import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function CalendarSidebar({
  dark,
  themeCard,
  themeMuted,
  year,
  month,
  setYear,
  setMonth,
  selectedDay,
  setSelectedDay,
  monthMatrix,
  MONTHS,
}) {
  const handlePrevYear = () => setYear((y) => y - 1);
  const handleNextYear = () => setYear((y) => y + 1);

  const handlePrevMonth = () =>
    setMonth((m) => {
      if (m === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });

  const handleNextMonth = () =>
    setMonth((m) => {
      if (m === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });

  const isDateInSelectedWeek = (date) => {
    if (!selectedDay) return false;
    const s = new Date(selectedDay);
    const off = (selectedDay.getDay() + 6) % 7;
    s.setDate(selectedDay.getDate() - off);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    return date >= s && date <= e;
  };

  return (
    <div className={`rounded-xl border ${themeCard} p-4`}>
      {/* Año / Mes */}
      <div className="mb-4 space-y-3">
        <div>
          <label className={`block text-sm ${themeMuted} mb-1`}>Año</label>
          <div
            className={`flex items-center border rounded-lg overflow-hidden ${
              dark ? 'border-slate-600' : 'border-gray-300'
            }`}
          >
            <button
              onClick={handlePrevYear}
              className={`px-2 ${
                dark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'
              }`}
              aria-label="Año anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="text"
              readOnly
              value={year}
              className={`flex-1 text-center py-1 text-sm ${
                dark ? 'bg-slate-900' : 'bg-white'
              }`}
            />
            <button
              onClick={handleNextYear}
              className={`px-2 ${
                dark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'
              }`}
              aria-label="Año siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <label className={`block text-sm ${themeMuted} mb-1`}>Mes</label>
          <select
            className={`w-full border rounded-lg px-2 py-1 ${
              dark
                ? 'bg-slate-900 border-slate-600'
                : 'bg-white border-gray-300'
            }`}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendario mensual */}
      <div className={`rounded-lg p-3 border ${themeCard}`}>
        <div className="flex items-center justify-between mb-2">
          <button
            className={`p-1 rounded ${
              dark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'
            }`}
            onClick={handlePrevMonth}
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="font-semibold">
            {MONTHS[month]} {year}
          </div>
          <button
            className={`p-1 rounded ${
              dark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'
            }`}
            onClick={handleNextMonth}
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Encabezados días */}
        <div
          className={`grid grid-cols-7 text-xs text-center ${themeMuted} mb-1`}
        >
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Días */}
        <div className="grid grid-cols-7 gap-1">
          {monthMatrix.flat().map((d, i) => {
            const inMonth = d.getMonth() === month;
            const isSelectedWeek = isDateInSelectedWeek(d);

            return (
              <button
                key={i}
                onClick={() => setSelectedDay(d)}
                className={`py-1.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  inMonth ? '' : themeMuted
                } ${
                  isSelectedWeek
                    ? dark
                      ? 'bg-slate-700 border border-slate-500'
                      : 'bg-blue-100 border border-blue-300'
                    : dark
                    ? 'hover:bg-slate-800'
                    : 'hover:bg-gray-200'
                }`}
                aria-label={`Seleccionar ${d.toISOString().slice(0, 10)}`}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>

        {/* Leyenda */}
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-green-600" />
            <span>Libre</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-blue-600" />
            <span>Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-red-600" />
            <span>Inhabilitado</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarSidebar;
