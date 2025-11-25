import React from 'react';

function RoomsDonut({ dark, themeCard, roomStats, ROOMS }) {
  return (
    <div
      className={`xl:col-span-6 rounded-xl border p-4 ${themeCard}`}
      role="group"
      aria-label="Disponibilidad de consultorios"
    >
      <h3 className="font-semibold mb-3">Disponibilidad de consultorios</h3>
      <div className="flex items-center gap-6">
        <div
          className="relative w-28 h-28"
          role="img"
          aria-label={`Ocupados: ${roomStats.donut.occupied}, Disponibles: ${roomStats.donut.free}`}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: '#e5e7eb' }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(#0ea5e9 0 ${
                (roomStats.donut.occupied * 100) / Math.max(1, ROOMS.length)
              }%, transparent 0 100%)`,
            }}
            aria-hidden="true"
          />
          <div
            className={`absolute inset-3 rounded-full ${
              dark ? 'bg-slate-900' : 'bg-white'
            }`}
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm">
            {Math.round(
              (roomStats.donut.occupied * 100) / Math.max(1, ROOMS.length)
            )}
            %
          </div>
        </div>
        <ul className="text-sm">
          <li>
            <span
              className="inline-block w-3 h-3 rounded mr-2"
              style={{ background: '#0ea5e9' }}
            />
            Ocupados: <strong>{roomStats.donut.occupied}</strong>
          </li>
          <li>
            <span
              className="inline-block w-3 h-3 rounded mr-2"
              style={{ background: '#e5e7eb' }}
            />
            Disponibles: <strong>{roomStats.donut.free}</strong>
          </li>
          <li className="text-xs text-gray-500">
            Total consultorios: {ROOMS.length}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default RoomsDonut;
