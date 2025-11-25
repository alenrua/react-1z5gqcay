import React from 'react';
import { X } from 'lucide-react';

function CreateSlotModal({
  open,
  onClose,
  dark,
  themeCard,
  selectedRange,
  form,
  setForm,
  TIME_SLOTS,
  ROOMS,
  doctor,
  isRoomTakenByOtherDoctor,
  handleSave,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div className={`rounded-xl p-6 w-[420px] shadow-lg ${themeCard}`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Crear franja</h3>
          <button onClick={onClose} aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-xs mb-3 text-gray-400">
          {selectedRange?.date} · {selectedRange?.start}–{selectedRange?.end}
        </div>

        <label className="block text-sm mb-1">Hora inicio</label>
        <select
          value={form.start}
          onChange={(e) => setForm({ ...form, start: e.target.value })}
          className={`w-full border rounded mb-2 px-2 py-1 ${
            dark ? 'bg-slate-900 border-slate-600' : 'bg-white border-gray-300'
          }`}
        >
          <option value="">Seleccione</option>
          {TIME_SLOTS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <label className="block text-sm mb-1">Hora fin</label>
        <select
          value={form.end}
          onChange={(e) => setForm({ ...form, end: e.target.value })}
          className={`w-full border rounded mb-2 px-2 py-1 ${
            dark ? 'bg-slate-900 border-slate-600' : 'bg-white border-gray-300'
          }`}
        >
          <option value="">Seleccione</option>
          {TIME_SLOTS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <p className="block text-sm font-medium mb-1">Asignar Consultorio</p>

        {selectedRange &&
          ROOMS.every((r) =>
            isRoomTakenByOtherDoctor(
              r,
              selectedRange.date,
              form.start || selectedRange.start,
              form.end || selectedRange.end,
              doctor
            )
          ) && (
            <div
              className={`rounded-lg border px-4 py-3 mb-3 ${
                dark
                  ? 'bg-rose-900/30 border-rose-700 text-rose-200'
                  : 'bg-rose-100 border-rose-300 text-rose-900'
              }`}
            >
              <strong>Sin consultorios disponibles</strong>
              <div className="text-sm opacity-90">
                No hay consultorios disponibles en este horario, seleccione otro
                espacio libre.
              </div>
            </div>
          )}

        <div className="grid grid-cols-4 gap-2 mb-3">
          {ROOMS.map((r) => {
            const disabled =
              selectedRange &&
              isRoomTakenByOtherDoctor(
                r,
                selectedRange.date,
                form.start || selectedRange.start,
                form.end || selectedRange.end,
                doctor
              );
            return (
              <button
                key={r}
                type="button"
                onClick={() => !disabled && setForm({ ...form, room: r })}
                disabled={disabled}
                title={
                  disabled
                    ? 'Ocupado para otro médico en este horario'
                    : `Asignar ${r}`
                }
                className={`px-3 py-2 rounded border text-sm
                  ${
                    form.room === r
                      ? dark
                        ? 'bg-sky-900 text-white border-sky-700'
                        : 'bg-blue-900 text-white border-blue-900'
                      : dark
                      ? 'bg-slate-900 border-slate-600'
                      : 'bg-white border-gray-300'
                  }
                  ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
                `}
              >
                {r}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          className={`w-full rounded py-2 font-medium ${
            dark
              ? 'bg-sky-700 hover:bg-sky-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Guardar franja
        </button>
      </div>
    </div>
  );
}

export default CreateSlotModal;
