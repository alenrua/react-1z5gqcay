// src/components/modals/PersonalBlockModal.jsx
import React from 'react';
import { X, ShieldBan, Save, RotateCcw } from 'lucide-react';

function PersonalBlockModal({
  open,
  onClose,
  blockForm,
  setBlockForm,
  onSave,
  doctorName,
  dark,
  themeCard,
  themeMuted,
}) {
  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlockForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setBlockForm((prev) => ({
      ...prev,
      type: 'VACACIONES',
      start: '',
      end: '',
    }));
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div
        className={`w-full max-w-lg rounded-xl border shadow-lg ${themeCard}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/40">
          <div className="flex items-center gap-2">
            <ShieldBan className="w-5 h-5 text-red-500" />
            <div>
              <h2 className="text-sm font-semibold">
                Bloqueo personal del médico
              </h2>
              <p className={`text-xs ${themeMuted}`}>
                Registra vacaciones o incapacidad para un médico específico.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-700/60"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4 space-y-4 text-sm">
          <div className={themeMuted}>
            Médico seleccionado:{' '}
            <span className="font-semibold text-xs">
              {doctorName || '—'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CC */}
            <div className="md:col-span-2">
              <label className="block mb-1 text-xs font-medium">
                Cédula del médico
              </label>
              <input
                type="text"
                name="cc"
                value={blockForm.cc || ''}
                onChange={handleChange}
                className={`w-full px-2 py-1 rounded border text-sm ${
                  dark
                    ? 'bg-slate-900 border-slate-600'
                    : 'bg-white border-gray-300'
                }`}
                placeholder="Ej. 1029673456"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block mb-1 text-xs font-medium">Tipo</label>
              <select
                name="type"
                value={blockForm.type || 'VACACIONES'}
                onChange={handleChange}
                className={`w-full px-2 py-1 rounded border text-sm ${
                  dark
                    ? 'bg-slate-900 border-slate-600'
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="VACACIONES">Vacaciones</option>
                <option value="INCAPACIDAD">Incapacidad</option>
              </select>
            </div>

            {/* Fechas */}
            <div>
              <label className="block mb-1 text-xs font-medium">
                Fecha inicio
              </label>
              <input
                type="date"
                name="start"
                value={blockForm.start || ''}
                onChange={handleChange}
                className={`w-full px-2 py-1 rounded border text-sm ${
                  dark
                    ? 'bg-slate-900 border-slate-600'
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-medium">
                Fecha fin
              </label>
              <input
                type="date"
                name="end"
                value={blockForm.end || ''}
                onChange={handleChange}
                className={`w-full px-2 py-1 rounded border text-sm ${
                  dark
                    ? 'bg-slate-900 border-slate-600'
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>

          <p className={`text-xs ${themeMuted}`}>
            El rango de fechas bloqueará la agenda completa del médico en esos
            días. Los conflictos con citas existentes se gestionan en el
            siguiente paso.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-700/40">
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded border border-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <RotateCcw className="w-3 h-3" />
            Limpiar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded border border-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-700"
          >
            <Save className="w-3 h-3" />
            Guardar bloqueo
          </button>
        </div>
      </div>
    </div>
  );
}

export default PersonalBlockModal;
