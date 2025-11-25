import React from 'react';

function BlocksBySpecialtyChart({ dark, themeCard, themeMuted, dashSpec, barPerSpecialty }) {
  return (
    <div
      className={`xl:col-span-8 rounded-xl border p-4 ${themeCard}`}
      aria-label="Bloqueos por especialidad"
      role="group"
    >
      <h3 className="font-semibold mb-3">
        Bloqueos por especialidad{' '}
        {dashSpec === 'ALL' ? '' : '(solo visible en vista general)'}
      </h3>

      {dashSpec !== 'ALL' ? (
        <p className={`text-sm ${themeMuted}`}>
          Cambia a “Todas las especialidades” para ver este gráfico.
        </p>
      ) : (
        <div className="w-full overflow-x-auto">
          <div
            className="flex items-end gap-3 h-60 px-1"
            role="img"
            aria-label="Gráfico de barras de bloqueos por especialidad"
            style={{
              width: `${Math.max(800, barPerSpecialty.length * 40)}px`,
            }}
          >
            {barPerSpecialty.map(({ sp, count }) => (
              <div
                key={sp}
                className="flex flex-col items-center justify-end flex-none"
                style={{ width: 28 }}
              >
                <div
                  title={`${sp}: ${count}`}
                  className="w-full"
                  style={{
                    height: `${Math.max(4, count * 10)}px`,
                    background: '#3b82f6',
                    borderRadius: '6px',
                  }}
                  aria-hidden="true"
                />
                <div
                  className="mt-2 text-[10px] text-center truncate w-full"
                  aria-hidden="true"
                >
                  {sp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BlocksBySpecialtyChart;
