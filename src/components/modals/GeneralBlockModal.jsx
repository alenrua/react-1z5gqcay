import React from 'react';
import { X } from 'lucide-react';

function GeneralBlockModal({
  open,
  onClose,
  dark,
  themeCard,
  themeMuted,
  generalForm,
  setGeneralForm,
  SPECIALTIES,
  TIME_SLOTS,
  allDoctors,
  onSave,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`rounded-xl p-6 w-[520px] shadow-lg max-h-[90vh] overflow-y-auto ${themeCard}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Crear Bloqueo General</h3>
          <button onClick={onClose} aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Rango de bloqueo *
            </label>
            <div className="space-y-2">
              <label className="block text-sm">
                <input
                  type="radio"
                  name="scope"
                  checked={generalForm.scope === 'ALL'}
                  onChange={() =>
                    setGeneralForm({ ...generalForm, scope: 'ALL' })
                  }
                />{' '}
                Todo el personal
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="scope"
                  checked={generalForm.scope === 'SPECIALTY'}
                  onChange={() =>
                    setGeneralForm({ ...generalForm, scope: 'SPECIALTY' })
                  }
                />
                <select
                  disabled={generalForm.scope !== 'SPECIALTY'}
                  value={generalForm.specialty}
                  onChange={(e) =>
                    setGeneralForm({
                      ...generalForm,
                      specialty: e.target.value,
                    })
                  }
                  className={`border rounded px-2 py-1 text-sm ${
                    dark
                      ? 'bg-slate-900 border-slate-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="scope"
                    checked={generalForm.scope === 'MANUAL'}
                    onChange={() =>
                      setGeneralForm({ ...generalForm, scope: 'MANUAL' })
                    }
                  />
                  <span className="text-sm">Manual</span>
                  <span
                    className={`inline-flex items-center justify-center text-xs rounded px-2 py-0.5 ${
                      dark
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {generalForm.doctors?.length || 0}
                  </span>
                </div>
                <div
                  className={`${
                    generalForm.scope !== 'MANUAL'
                      ? 'opacity-50 pointer-events-none'
                      : ''
                  } mt-1`}
                >
                  <div
                    className={`border rounded-lg overflow-hidden flex ${themeCard}`}
                  >
                    <div
                      className={`w-64 max-h-64 overflow-auto ${
                        dark ? 'bg-slate-900' : 'bg-gray-50'
                      }`}
                    >
                      <ul>
                        {allDoctors.map((d) => (
                          <li
                            key={d}
                            className={`flex items-center gap-2 px-3 py-2 border-b last:border-b-0 ${
                              dark ? 'border-slate-700' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={(generalForm.doctors || []).includes(d)}
                              onChange={(e) => {
                                const s = new Set(generalForm.doctors || []);
                                if (e.target.checked) s.add(d);
                                else s.delete(d);
                                setGeneralForm({
                                  ...generalForm,
                                  doctors: [...s],
                                });
                              }}
                            />
                            <span className="text-sm">{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo de evento *
            </label>
            <input
              type="text"
              value={generalForm.eventType || ''}
              onChange={(e) =>
                setGeneralForm({
                  ...generalForm,
                  eventType: e.target.value,
                })
              }
              maxLength={100}
              placeholder="Ej: Jornada de limpieza"
              className={`w-full border rounded px-2 py-2 ${
                dark
                  ? 'bg-slate-900 border-slate-600'
                  : 'bg-white border-gray-300'
              }`}
            />
            <p className={`text-xs mt-1 ${themeMuted}`}>
              Máximo 100 caracteres.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                value={generalForm.startDate || ''}
                onChange={(e) =>
                  setGeneralForm({
                    ...generalForm,
                    startDate: e.target.value,
                  })
                }
                className={`w-full border rounded px-2 py-2 ${
                  dark
                    ? 'bg-slate-900 border-slate-600'
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha de Fin *
              </label>
              <input
                type="date"
                value={generalForm.endDate || ''}
                onChange={(e) =>
                  setGeneralForm({
                    ...generalForm,
                    endDate: e.target.value,
                  })
                }
                className={`w-full border rounded px-2 py-2 ${
                  dark
                    ? 'bg-slate-900 border-slate-600'
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Hora de Inicio
              </label>
              <select
                value={generalForm.startTime || ''}
                onChange={(e) =>
                  setGeneralForm({
                    ...generalForm,
                    startTime: e.target.value,
                  })
                }
                className={`w-full border rounded px-2 py-2 ${
                  dark
                    ? 'bg-slate-900 border-slate-600'
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="">8:00 AM (por defecto)</option>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Hora de Fin
              </label>
              <select
                value={generalForm.endTime || ''}
                onChange={(e) =>
                  setGeneralForm({
                    ...generalForm,
                    endTime: e.target.value,
                  })
                }
                className={`w-full border rounded px-2 py-2 ${
                  dark
                    ? 'bg-slate-900 border-slate-600'
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="">6:00 PM (por defecto)</option>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            className={`rounded-lg p-3 text-sm ${
              dark
                ? 'bg-sky-900/30 text-sky-200 border border-sky-800'
                : 'bg-blue-100 text-blue-900 border-blue-200'
            }`}
          >
            <p className="font-medium">Horario de bloqueo</p>
            <p>
              Las franjas dentro del rango seleccionado se inhabilitarán para
              agendamiento. Si no se definen horas, se bloqueará de 8:00 AM a
              6:00 PM.
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded border ${
              dark
                ? 'border-slate-600 hover:bg-slate-800'
                : 'border-gray-300 hover:bg-gray-100'
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className={`px-4 py-2 rounded text-white ${
              dark
                ? 'bg-sky-700 hover:bg-sky-600'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Crear Bloqueo General
          </button>
        </div>
      </div>
    </div>
  );
}

export default GeneralBlockModal;
