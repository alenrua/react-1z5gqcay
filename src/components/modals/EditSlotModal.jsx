import React from 'react';
import { X, Save } from 'lucide-react';

function EditSlotModal({
  open,
  onClose,
  dark,
  themeCard,
  selectedExisting,
  editRoom,
  setEditRoom,
  ROOMS,
  saveEditRoom,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div className={`rounded-xl p-6 w-[560px] shadow-lg ${themeCard}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Editar Franja</h3>
          <button onClick={onClose} aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div
          className={`rounded-lg p-3 text-sm border ${
            dark
              ? 'bg-slate-900/40 border-slate-700'
              : 'bg-blue-50 border-blue-100'
          }`}
        >
          <p className="font-semibold">Franja Actual:</p>
          <p>
            Día:{' '}
            {selectedExisting
              ? new Date(selectedExisting.date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                })
              : ''}
          </p>
          <p>
            Horario: {selectedExisting?.start} - {selectedExisting?.end}
          </p>
          <p>Consultorio: {selectedExisting?.room || '—'}</p>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Asignar Consultorio</p>
          <div className="grid grid-cols-4 gap-2">
            {ROOMS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setEditRoom(r)}
                className={`px-3 py-2 rounded border text-sm
                  ${
                    editRoom === r
                      ? dark
                        ? 'bg-sky-900 text-white border-sky-700'
                        : 'bg-blue-900 text-white border-blue-900'
                      : dark
                      ? 'bg-slate-900 border-slate-600'
                      : 'bg-white border-gray-300'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            onClick={saveEditRoom}
            className={`px-4 py-2 rounded text-white inline-flex items-center gap-2 ${
              dark
                ? 'bg-slate-700 hover:bg-slate-600'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <Save className="w-4 h-4" /> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditSlotModal;
