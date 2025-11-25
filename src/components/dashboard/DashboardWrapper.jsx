import React from 'react';
import BlocksBySpecialtyChart from './BlocksBySpecialtyChart';
import TimeSeriesChart from './TimeSeriesChart';
import BlockTypePie from './BlockTypePie';
import RoomsDonut from './RoomsDonut';
import RoomsTable from './RoomsTable';

function DashboardWrapper({
  dark,
  themeCard,
  themeHead,
  themeMuted,
  dashTime,
  setDashTime,
  dashSpec,
  setDashSpec,
  dashSeriesType,
  setDashSeriesType,
  SPECIALTIES,
  timeSeries,
  barPerSpecialty,
  pieCounts,
  roomStats,
  ROOMS,
}) {
  return (
    <div className={`rounded-xl border p-8 ${themeCard}`}>
      <p className={`text-center ${themeMuted}`}>
        Selecciona una{' '}
        <strong className={dark ? 'text-slate-100' : 'text-gray-900'}>
          especialidad
        </strong>{' '}
        y un{' '}
        <strong className={dark ? 'text-slate-100' : 'text-gray-900'}>
          médico
        </strong>{' '}
        para visualizar y editar la agenda.
      </p>

      <div className="mt-6">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div>
            <label className={`block text-sm ${themeMuted} mb-1`}>
              Rango de tiempo
            </label>
            <div className="flex gap-2">
              {['week', 'month', 'year'].map((k) => (
                <button
                  key={k}
                  onClick={() => setDashTime(k)}
                  className={`px-3 py-1 rounded border text-sm ${
                    dashTime === k
                      ? dark
                        ? 'bg-slate-700 text-white'
                        : 'bg-gray-900 text-white'
                      : dark
                      ? 'border-slate-600'
                      : 'border-gray-300'
                  }`}
                >
                  {k === 'week' ? 'Semana' : k === 'month' ? 'Mes' : 'Año'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={`block text-sm ${themeMuted} mb-1`}>
              Especialidad
            </label>
            <select
              value={dashSpec}
              onChange={(e) => setDashSpec(e.target.value)}
              className={`rounded-lg border px-3 py-2 ${
                dark
                  ? 'bg-slate-900 border-slate-600'
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="ALL">Todas las especialidades</option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm ${themeMuted} mb-1`}>
              Serie temporal
            </label>
            <div className="flex gap-2">
              {['PERSONAL', 'GENERAL'].map((t) => (
                <button
                  key={t}
                  onClick={() => setDashSeriesType(t)}
                  className={`px-3 py-1 rounded border text-sm ${
                    dashSeriesType === t
                      ? dark
                        ? 'bg-slate-700 text-white'
                        : 'bg-gray-900 text-white'
                      : dark
                      ? 'border-slate-600'
                      : 'border-gray-300'
                  }`}
                >
                  {t === 'PERSONAL'
                    ? 'Bloqueos personales'
                    : 'Bloqueos generales'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tarjetas y gráficos */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
          <BlocksBySpecialtyChart
            dark={dark}
            themeCard={themeCard}
            themeMuted={themeMuted}
            dashSpec={dashSpec}
            barPerSpecialty={barPerSpecialty}
          />
          <TimeSeriesChart
            dark={dark}
            themeCard={themeCard}
            dashSeriesType={dashSeriesType}
            timeSeries={timeSeries}
          />
          <BlockTypePie
            dark={dark}
            themeCard={themeCard}
            themeMuted={themeMuted}
            pieCounts={pieCounts}
          />
          <RoomsDonut
            dark={dark}
            themeCard={themeCard}
            roomStats={roomStats}
            ROOMS={ROOMS}
          />
        </div>

        <RoomsTable
          dark={dark}
          themeCard={themeCard}
          themeHead={themeHead}
          themeMuted={themeMuted}
          roomStats={roomStats}
        />
      </div>
    </div>
  );
}

export default DashboardWrapper;
