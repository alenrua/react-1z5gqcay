import React from 'react';

function WeeklyGrid({
  dark,
  themeCard,
  themeHead,
  themeMuted,
  DAYS,
  MONTHS,
  TIME_SLOTS,
  weekDays,
  doctor,
  blockedDates,
  drag,
  selectedRange,
  onMouseDownCell,
  onMouseEnterCell,
  finishDrag,
  timeToIdx,
  isPastWeek,
  isBusy,
  isBlockedByPersonal,
  isBlockedByGeneral,
  getSlotAt,
  pill,
}) {
  return (
    <div className={`rounded-xl border overflow-auto select-none ${themeCard}`}>
      <table
        className="w-full text-sm border-collapse"
        role="grid"
        aria-readonly="true"
      >
        <thead className={themeHead}>
          <tr>
            <th
              className={`border p-3 text-left w-[90px] ${
                dark ? 'border-slate-700' : 'border-gray-200'
              }`}
            >
              Horario
            </th>
            {weekDays.map((d, idx) => (
              <th
                key={idx}
                className={`border p-3 text-center min-w-[140px] ${
                  dark ? 'border-slate-700' : 'border-gray-200'
                }`}
              >
                <div className="font-medium">{DAYS[idx]}</div>
                <div className={`text-xs ${themeMuted}`}>
                  {d.getDate()}{' '}
                  {MONTHS[d.getMonth()].slice(0, 3).toLowerCase()}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map((t, rowIdx) => (
            <tr key={t}>
              <td
                className={`border p-2 font-medium text-center ${
                  dark ? 'border-slate-700' : 'border-gray-200'
                }`}
              >
                {t}
              </td>
              {weekDays.map((d, colIdx) => {
                const date = d.toISOString().slice(0, 10);
                const busy = isBusy(date, t);
                const blocked =
                  blockedDates.includes(date) ||
                  isBlockedByPersonal(doctor, date) ||
                  isBlockedByGeneral(doctor, date, t);

                const status = blocked ? 'BLOCKED' : busy ? 'BUSY' : 'FREE';
                const slotAt = busy ? getSlotAt(doctor, date, t) : null;

                let tooltip = '';
                if (status === 'BLOCKED') {
                  const byPersonal = isBlockedByPersonal(doctor, date);
                  tooltip = byPersonal
                    ? 'Inhabilitado por bloqueo personal'
                    : 'Inhabilitado por bloqueo general';
                } else if (status === 'BUSY') {
                  tooltip = slotAt?.room
                    ? `Ocupado ${slotAt.room}`
                    : 'Ocupado';
                } else {
                  tooltip = 'Disponible';
                }

                const label =
                  status === 'FREE'
                    ? 'Disponible'
                    : status === 'BUSY'
                    ? `Ocupado${slotAt?.room ? ` ${slotAt.room}` : ''}`
                    : 'Inhabilitado';

                const selectable = status === 'FREE' && !isPastWeek(date);

                const isDraggingColumn = drag.active && drag.date === date;
                const a = Math.min(drag.startIdx, drag.endIdx);
                const b = Math.max(drag.startIdx, drag.endIdx);
                const inDrag =
                  isDraggingColumn &&
                  rowIdx >= a &&
                  rowIdx <= b &&
                  selectable;

                const inSelected =
                  selectedRange &&
                  selectedRange.date === date &&
                  rowIdx >= timeToIdx(selectedRange.start) &&
                  rowIdx < timeToIdx(selectedRange.end);

                return (
                  <td
                    key={colIdx}
                    title={tooltip}
                    className={`border p-1 text-center ${
                      dark ? 'border-slate-700' : 'border-gray-200'
                    } ${inDrag ? 'outline outline-2 outline-black' : ''} ${
                      inSelected ? 'ring-2 ring-black' : ''
                    }`}
                    onMouseDown={() =>
                      onMouseDownCell(date, rowIdx, t, status, selectable)
                    }
                    onMouseEnter={() =>
                      onMouseEnterCell(date, rowIdx, selectable)
                    }
                    onMouseUp={finishDrag}
                  >
                    <span
                      className={`inline-block w-full rounded px-2 py-1 ${
                        pill[status]
                      } ${
                        selectable
                          ? 'cursor-crosshair'
                          : status === 'BUSY'
                          ? 'cursor-pointer'
                          : 'opacity-70 cursor-not-allowed'
                      }`}
                    >
                      {label}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WeeklyGrid;
