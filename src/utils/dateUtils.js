// src/utils/dateUtils.js
import { MONTHS } from '../constants/dates';

export const fmtDateLong = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

export const isPastDay = (iso) => {
  const d = new Date(iso);
  const t = new Date();
  d.setHours(0, 0, 0, 0);
  t.setHours(0, 0, 0, 0);
  return d.getTime() < t.getTime();
};

export const getMonthMatrix = (year, monthIndex) => {
  const first = new Date(year, monthIndex, 1);
  const start = new Date(first);
  const off = (first.getDay() + 6) % 7; // lunes = 0
  start.setDate(first.getDate() - off);
  return Array.from({ length: 6 }, (_, r) =>
    Array.from({ length: 7 }, (_, c) => {
      const d = new Date(start);
      d.setDate(start.getDate() + r * 7 + c);
      return d;
    })
  );
};

export const getWeekDays = (selectedDay) => {
  const s = new Date(selectedDay);
  const off = (s.getDay() + 6) % 7;
  s.setDate(s.getDate() - off);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(s);
    d.setDate(s.getDate() + i);
    return d;
  });
};

export const toShortLabel = (d) =>
  `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3).toLowerCase()}`;
