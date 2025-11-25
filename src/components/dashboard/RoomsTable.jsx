import React from 'react';

function RoomsTable({ dark, themeCard, themeHead, themeMuted, roomStats }) {
  return (
    <div className="mt-6">
      <div
        className={`rounded-xl border p-4 overflow-auto ${themeCard}`}
        role="table"
        aria-label="Detalle por consultorio"
      >
        <h3 className="font-semibold mb-3">Detalle por consultorio</h3>
        <table className="w-full text-sm border-collapse">
          <thead className={themeHead}>
            <tr>
              <th
                className={`border p-2 ${
                  dark ? 'border-slate-700' : 'border-gray-200'
                } text-left`}
              >
                Código
              </th>
              <th
                className={`border p-2 ${
                  dark ? 'border-slate-700' : 'border-gray-200'
                } text-right`}
              >
                Franjas disponibles
              </th>
              <th
                className={`border p-2 ${
                  dark ? 'border-slate-700' : 'border-gray-200'
                } text-right`}
              >
                Franjas ocupadas
              </th>
              <th
                className={`border p-2 ${
                  dark ? 'border-slate-700' : 'border-gray-200'
                } text-right`}
              >
                Ocupación (%)
              </th>
            </tr>
          </thead>
          <tbody>
            {roomStats.rows.map((r) => (
              <tr key={r.room}>
                <td
                  className={`border p-2 ${
                    dark ? 'border-slate-700' : 'border-gray-200'
                  }`}
                >
                  {r.room}
                </td>
                <td
                  className={`border p-2 text-right ${
                    dark ? 'border-slate-700' : 'border-gray-200'
                  }`}
                >
                  {r.free}
                </td>
                <td
                  className={`border p-2 text-right ${
                    dark ? 'border-slate-700' : 'border-gray-200'
                  }`}
                >
                  {r.busy}
                </td>
                <td
                  className={`border p-2 text-right ${
                    dark ? 'border-slate-700' : 'border-gray-200'
                  }`}
                >
                  {r.pct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={`text-xs mt-2 ${themeMuted}`}>
          Ocupación = (franjas ocupadas ÷ franjas totales) × 100, por rango
          seleccionado.
        </p>
      </div>
    </div>
  );
}

export default RoomsTable;
