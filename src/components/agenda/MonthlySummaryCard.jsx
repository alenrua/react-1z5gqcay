import React from 'react';

export default function MonthlySummaryCard({
  role,
  ready,
  doctor,
  month,
  year,
  MONTHS,
  monthlyMetrics,
  themeCard,
  themeMuted,
  dark,
}) {
  const monthName = MONTHS[month];

  if (!ready || !doctor || !monthlyMetrics) {
    return (
      <div className={`mt-4 rounded-xl border p-4 text-sm ${themeCard}`}>
        <p className={themeMuted}>
          Selecciona una especialidad y un médico para ver el resumen mensual.
        </p>
      </div>
    );
  }

  const {
    assigned,
    blockedPersonal,
    blockedGeneral,
    free,
    pct,
    level,
    referenceSlots,
    available,
  } = monthlyMetrics;

  const levelLabel =
    level === 'HIGH' ? 'Carga alta'
      : level === 'MEDIUM' ? 'Carga media'
      : 'Carga baja';

  const levelColor =
    level === 'HIGH'
      ? dark
        ? 'bg-red-600 text-red-50'
        : 'bg-red-100 text-red-700'
      : level === 'MEDIUM'
      ? dark
        ? 'bg-amber-600 text-amber-50'
        : 'bg-amber-100 text-amber-700'
      : dark
      ? 'bg-emerald-700 text-emerald-50'
      : 'bg-emerald-100 text-emerald-700';

  return (
    <div className={`mt-4 rounded-xl border p-4 text-sm ${themeCard}`}>
      <h2 className="text-base font-semibold mb-1">
        Resumen mensual del médico
      </h2>
      <p className={`text-xs mb-3 ${themeMuted}`}>
        {`${monthName} ${year} · ${doctor}`}
      </p>

      <p className={`text-xs mb-4 ${themeMuted}`}>
        La siguiente información ofrece una visión integral de las franjas
        asignadas y bloqueos del médico durante el mes, útil para ajustar su
        agenda.
      </p>

      {/* Totales */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
        <div>
          <p className={`text-xs ${themeMuted}`}>Total de franjas asignadas</p>
          <p className="text-base font-semibold">{assigned}</p>
        </div>
        <div>
          <p className={`text-xs ${themeMuted}`}>Total de bloqueos personales</p>
          <p className="text-base font-semibold">{blockedPersonal}</p>
        </div>

        <div>
          <p className={`text-xs ${themeMuted}`}>Total de bloqueos generales</p>
          <p className="text-base font-semibold">{blockedGeneral}</p>
        </div>
        <div>
          <p className={`text-xs ${themeMuted}`}>Total de franjas disponibles</p>
          {/* ahora usamos available, NO free */}
          <p className="text-base font-semibold">{available}</p>
        </div>
      </div>

      {/* Porcentaje de ocupación */}
      <div className="mb-4">
        <p className={`text-xs ${themeMuted}`}>
          Porcentaje de ocupación del mes
          <br />
          <span className="italic">
            (franjas asignadas sobre franjas de referencia sin bloqueos)
          </span>
        </p>

        <p className="text-3xl font-semibold mt-1">
          {referenceSlots > 0 ? `${pct}%` : '--'}
        </p>
        <p className={`text-xs mt-1 ${themeMuted}`}>
          {referenceSlots > 0
            ? `de ${referenceSlots} franjas de referencia`
            : 'Sin franjas de referencia para este período'}
        </p>

        <div className="mt-2 inline-flex items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${levelColor}`}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-current" />
            {levelLabel}
          </span>
        </div>
      </div>

      <p className={`text-[11px] leading-relaxed ${themeMuted}`}>
        Los datos se actualizan automáticamente cuando se agregan, modifican o
        eliminan franjas o bloqueos del médico. La visualización es únicamente
        interna: no se permite exportar ni descargar la información.
      </p>
    </div>
  );
}
