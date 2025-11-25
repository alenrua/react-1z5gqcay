import React from 'react';

function BlockTypePie({ dark, themeCard, themeMuted, pieCounts }) {
  return (
    <div
      className={`xl:col-span-6 rounded-xl border p-4 ${themeCard}`}
      aria-label="Distribución de bloqueos por tipo"
      role="group"
    >
      <h3 className="font-semibold mb-3">Distribución por tipo (%)</h3>
      <div className="flex items-center gap-6">
        <div
          aria-label={`Vacaciones ${pieCounts.pct.VACACIONES}%, Incapacidad ${pieCounts.pct.INCAPACIDAD}%, Bloqueo general ${pieCounts.pct.GENERAL}%`}
          className="w-32 h-32 rounded-full"
          style={{
            background: `conic-gradient(#22c55e 0 ${pieCounts.pct.VACACIONES}%,
                     #3b82f6 ${pieCounts.pct.VACACIONES}% ${
              pieCounts.pct.VACACIONES + pieCounts.pct.INCAPACIDAD
            }%,
                     #ef4444 ${
                       pieCounts.pct.VACACIONES + pieCounts.pct.INCAPACIDAD
                     }% 100%)`,
          }}
        />
        <ul className="text-sm">
          <li>
            <span
              className="inline-block w-3 h-3 rounded mr-2"
              style={{ background: '#22c55e' }}
            />
            Vacaciones: <strong>{pieCounts.pct.VACACIONES}%</strong>
          </li>
          <li>
            <span
              className="inline-block w-3 h-3 rounded mr-2"
              style={{ background: '#3b82f6' }}
            />
            Incapacidad: <strong>{pieCounts.pct.INCAPACIDAD}%</strong>
          </li>
          <li>
            <span
              className="inline-block w-3 h-3 rounded mr-2"
              style={{ background: '#ef4444' }}
            />
            Bloqueo general: <strong>{pieCounts.pct.GENERAL}%</strong>
          </li>
        </ul>
      </div>
      <p className={`text-xs mt-2 ${themeMuted}`}>
        El porcentaje se calcula sobre todos los bloqueos dentro del rango
        seleccionado.
      </p>
    </div>
  );
}

export default BlockTypePie;
