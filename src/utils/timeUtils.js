// src/utils/timeUtils.js

// 8:00–18:00 en bloques de 30 minutos
export const TIME_SLOTS = Array.from({ length: 20 }, (_, i) => {
  const h = Math.floor(i / 2) + 8;
  const m = i % 2 ? '30' : '00';
  return `${String(h).padStart(2, '0')}:${m}`;
});

const END_OF_DAY = '18:00';

export const timeToIdx = (t) => {
  const [H, M] = t.split(':').map(Number);
  return (H - 8) * 2 + (M === 30 ? 1 : 0);
};

export const idxToTime = (i) =>
  TIME_SLOTS[Math.max(0, Math.min(TIME_SLOTS.length - 1, i))];

export const cellEnd = (t) => {
  const idx = TIME_SLOTS.indexOf(t);
  if (idx === -1) return t;
  if (idx === TIME_SLOTS.length - 1) return END_OF_DAY;
  return TIME_SLOTS[idx + 1];
};

export const overlaps = (aS, aE, bS, bE) =>
  timeToIdx(aS) < timeToIdx(bE) && timeToIdx(bS) < timeToIdx(aE);

export const fmtTime12 = (hhmm) => {
  const [h, m] = (hhmm || '08:00').split(':');
  let H = Number(h);
  const ampm = H >= 12 ? 'PM' : 'AM';
  H = H % 12;
  if (H === 0) H = 12;
  return `${H}:${m} ${ampm}`;
};
