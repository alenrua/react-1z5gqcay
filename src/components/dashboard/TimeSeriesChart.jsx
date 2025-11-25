import React from 'react';

function TimeSeriesChart({ dark, themeCard, dashSeriesType, timeSeries }) {
  return (
    <div
      className={`xl:col-span-4 rounded-xl border p-4 ${themeCard}`}
      aria-label="Serie temporal de bloqueos"
      role="group"
    >
      <h3 className="font-semibold mb-3">
        Evolución de bloqueos (
        {dashSeriesType === 'PERSONAL' ? 'personales' : 'generales'}
        )
      </h3>
      <svg
        width="100%"
        height="220"
        viewBox="0 0 360 180"
        role="img"
        aria-label="Gráfico de líneas de bloqueos en el tiempo"
      >
        <line
          x1="30"
          y1="10"
          x2="30"
          y2="170"
          stroke={dark ? '#94a3b8' : '#cbd5e1'}
        />
        <line
          x1="30"
          y1="170"
          x2="350"
          y2="170"
          stroke={dark ? '#94a3b8' : '#cbd5e1'}
        />
        {(() => {
          const max = Math.max(1, ...timeSeries.map((p) => p.value));
          const pts = timeSeries
            .map((p, i) => {
              const x =
                30 + (320 * (i / Math.max(1, timeSeries.length - 1)));
              const y = 170 - (150 * (p.value / max));
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <>
              <polyline
                points={pts}
                fill="none"
                stroke={dark ? '#38bdf8' : '#0ea5e9'}
                strokeWidth="2.5"
              />
              {timeSeries.map((p, i) => {
                const maxInner = Math.max(1, ...timeSeries.map((q) => q.value));
                const x =
                  30 + (320 * (i / Math.max(1, timeSeries.length - 1)));
                const y = 170 - (150 * (p.value / maxInner));
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3"
                    fill={dark ? '#38bdf8' : '#0ea5e9'}
                  />
                );
              })}
            </>
          );
        })()}
      </svg>
      <div
        className="mt-1 text-[11px] grid grid-cols-6 gap-1"
        aria-hidden="true"
      >
        {timeSeries
          .filter((_, i) => i % Math.ceil(timeSeries.length / 6 || 1) === 0)
          .map((p) => (
            <div key={p.x} className="truncate text-center">
              {p.label}
            </div>
          ))}
      </div>
    </div>
  );
}

export default TimeSeriesChart;
