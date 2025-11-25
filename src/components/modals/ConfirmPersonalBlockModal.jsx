import React from 'react';
import { X } from 'lucide-react';

function ConfirmPersonalBlockModal({
  open,
  onClose,
  confirmPersonal,
  fmtDateLong,
  fmtTime12,
  themeCard,
  themeMuted,
  dark,
  doConfirmPersonal,
  doConfirmPersonalReassign,
  doConfirmPersonalCancel,
}) {
  if (!open) return null;

  const data = confirmPersonal.data;
  const conflicts = data?.conflicts || [];
  const canReassign = conflicts.filter((c) => c.suggestion);
  const cannot = conflicts.filter((c) => !c.suggestion);
  const disableReassign = conflicts.length > 0 && canReassign.length === 0;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`rounded-xl p-0 w-[620px] shadow-lg overflow-hidden ${themeCard}`}
      >
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            dark ? 'border-slate-700' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg ${
                dark ? 'bg-sky-800' : 'bg-blue-100'
              } flex items-center justify-center`}
            />
            <div>
              <p className="text-lg font-semibold">Bloqueos Personales</p>
              <p className={`text-xs ${themeMuted}`}>1 bloqueo Registrado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`${
              dark ? 'text-rose-300' : 'text-red-600'
            } text-sm flex items-center gap-1`}
          >
            Cerrar <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <div
            className={`rounded-xl p-4 border ${
              dark
                ? 'bg-slate-900/40 border-slate-700'
                : 'bg-blue-50 border-blue-100'
            }`}
          >
            <div className="flex items-start justify-between">
              <p
                className={`${
                  dark ? 'text-green-300' : 'text-green-700'
                } font-semibold`}
              >
                {data?.type === 'VACACIONES' ? 'Vacaciones' : 'Incapacidad'}
              </p>
              <p className={`text-xs ${themeMuted}`}>
                Creado el {fmtDateLong(data?.createdAt)}
              </p>
            </div>
            <div className="mt-2 text-sm">
              <p>
                <strong>{data?.doctor}</strong> - {data?.spec}
              </p>
              <p className="mt-1">
                {fmtDateLong(data?.start)} - {fmtDateLong(data?.end)}
              </p>
            </div>
            <div
              className={`mt-3 rounded-lg p-3 border text-sm ${
                dark ? 'bg-slate-900/50 border-slate-700' : ''
              }`}
            >
              <p className="font-semibold">Horario bloqueado:</p>
              <p>
                {fmtTime12('08:00')} - {fmtTime12('18:00')} (jornada completa)
              </p>
              <p className={`mt-1 ${themeMuted}`}>
                Las franjas en este período no están disponibles para
                agendamiento de citas.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold mb-2">
              Conflictos detectados: {conflicts.length}
            </h4>

            {conflicts.length === 0 ? (
              <p className={`text-sm ${themeMuted}`}>
                No se encontraron franjas ocupadas en el rango. Se aplicará el
                bloqueo sin cambios en agenda.
              </p>
            ) : (
              <>
                {canReassign.length > 0 && (
                  <div
                    className={`rounded-lg p-3 mb-3 border ${
                      dark ? 'border-slate-700 bg-slate-900/40' : ''
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">
                      Reasignables ({canReassign.length})
                    </p>
                    <ul className="text-xs grid grid-cols-1 md:grid-cols-2 gap-1">
                      {canReassign.slice(0, 6).map((c, i) => (
                        <li key={`r-${i}`}>
                          • {fmtDateLong(c.date)} · {c.start}-{c.end} →{' '}
                          <strong>{c.suggestion?.doctor}</strong> (
                          {c.suggestion?.room})
                        </li>
                      ))}
                    </ul>
                    {canReassign.length > 6 && (
                      <p className={`text-xs mt-1 ${themeMuted}`}>
                        …y {canReassign.length - 6} más
                      </p>
                    )}
                  </div>
                )}
                {cannot.length > 0 && (
                  <div
                    className={`rounded-lg p-3 mb-3 border ${
                      dark ? 'border-slate-700 bg-slate-900/40' : ''
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">
                      Sin disponibilidad en la especialidad ({cannot.length})
                    </p>
                    <p className={`text-xs ${themeMuted}`}>
                      Estas franjas serán <strong>canceladas</strong> si decides
                      continuar.
                    </p>
                    <ul className="text-xs grid grid-cols-1 md:grid-cols-2 gap-1">
                      {cannot.slice(0, 6).map((c, i) => (
                        <li key={`c-${i}`}>
                          • {fmtDateLong(c.date)} · {c.start}-{c.end}
                        </li>
                      ))}
                    </ul>
                    {cannot.length > 6 && (
                      <p className={`text-xs mt-1 ${themeMuted}`}>
                        …y {cannot.length - 6} más
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="mt-3 flex flex-col md:flex-row gap-2">
              {conflicts.length > 0 ? (
                <>
                  <button
                    onClick={doConfirmPersonalReassign}
                    disabled={disableReassign}
                    aria-disabled={disableReassign}
                    title={
                      disableReassign
                        ? 'No hay disponibilidad en la especialidad para reasignar'
                        : 'Reasignar disponibles y bloquear'
                    }
                    className={`flex-1 py-2 rounded-lg text-white ${
                      dark
                        ? 'bg-sky-700 hover:bg-sky-600'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-inherit`}
                  >
                    Reasignar disponibles y bloquear
                  </button>
                  <button
                    onClick={doConfirmPersonalCancel}
                    className={`flex-1 py-2 rounded-lg border ${
                      dark
                        ? 'border-slate-600 hover:bg-slate-800'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    Cancelar esas franjas y bloquear
                  </button>
                </>
              ) : (
                <button
                  onClick={doConfirmPersonal}
                  className={`w-full py-3 rounded-lg text-white ${
                    dark
                      ? 'bg-sky-700 hover:bg-sky-600'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Confirmar bloqueo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmPersonalBlockModal;
