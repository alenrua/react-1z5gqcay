// src/utils/scheduleUtils.js
import { TIME_SLOTS, timeToIdx, cellEnd, overlaps } from './timeUtils';

// ¿Está ocupado un médico en un horario?
export const isBusy = (slotsByDoctor, doctorName, dateISO, t) => {
  const list = slotsByDoctor[doctorName] || [];
  return list.some(
    (s) => s.date === dateISO && overlaps(s.start, s.end, t, cellEnd(t))
  );
};

// Devuelve la franja exacta en la que cae t
export const getSlotAt = (slotsByDoctor, doctorName, dateISO, t) => {
  const list = slotsByDoctor[doctorName] || [];
  return list.find(
    (s) => s.date === dateISO && overlaps(s.start, s.end, t, cellEnd(t))
  );
};

// Rango completo libre (para ese doctor y fecha)
export const rangeAllFree = (
  { slotsByDoctor, blockedDates },
  doctorName,
  dateISO,
  start,
  end,
  isBlockedByGeneral
) => {
  if (blockedDates.includes(dateISO)) return false;
  const s = timeToIdx(start);
  const e = timeToIdx(end);
  if (!(TIME_SLOTS.includes(start) && TIME_SLOTS.includes(end))) return false;
  if (e <= s) return false;
  for (let i = s; i < e; i++) {
    const t = TIME_SLOTS[i];
    if (isBusy(slotsByDoctor, doctorName, dateISO, t)) return false;
    if (isBlockedByGeneral(doctorName, dateISO, t)) return false;
  }
  return true;
};
