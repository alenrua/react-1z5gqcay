// src/hooks/useAgendaState.js
import { useState, useCallback } from 'react';
import { ROOMS } from '../constants/rooms';
import { DOCTOR_CC } from '../constants/doctors';
import {
  TIME_SLOTS,
  timeToIdx,
  idxToTime,
  overlaps,
} from '../utils/timeUtils';

export function useAgendaState() {
  const [slotsByDoctor, setSlotsByDoctor] = useState({});
  const [personalBlocks, setPersonalBlocks] = useState([]); // {cc,type,start,end}
  const [generalBlocks, setGeneralBlocks] = useState([]);   // {scope,...}
  const [blockedDates] = useState([]); // reservado, por si luego se usa

  const getSlotsFor = useCallback(
    (doctorName) => slotsByDoctor[doctorName] || [],
    [slotsByDoctor]
  );

  const isTimeWithin = (t, startT, endT) =>
    timeToIdx(t) >= timeToIdx(startT) && timeToIdx(t) < timeToIdx(endT);

  const isBlockedByPersonal = useCallback(
    (doctorName, dateISO) => {
      const cc = DOCTOR_CC[doctorName];
      return personalBlocks.some(
        (b) => b.cc === cc && dateISO >= b.start && dateISO <= b.end
      );
    },
    [personalBlocks]
  );

  const isBlockedByGeneral = useCallback(
    (doctorName, dateISO, time) => {
      if (isBlockedByPersonal(doctorName, dateISO)) return false;
      return generalBlocks.some((g) => {
        if (!(dateISO >= g.startDate && dateISO <= g.endDate)) return false;
        const s = g.startTime || '08:00';
        const e = g.endTime || '18:00';
        if (!isTimeWithin(time, s, e)) return false;
        if (g.scope === 'ALL') return true;
        if (g.scope === 'SPECIALTY')
          return (g.doctorsInSpecialty || []).includes(doctorName);
        if (g.scope === 'MANUAL') return (g.doctors || []).includes(doctorName);
        return false;
      });
    },
    [generalBlocks, isBlockedByPersonal]
  );

  const isBusyFor = useCallback(
    (doctorName, dateISO, t) =>
      (slotsByDoctor[doctorName] || []).some(
        (s) => s.date === dateISO && overlaps(s.start, s.end, t, idxToTime(timeToIdx(t) + 1))
      ),
    [slotsByDoctor]
  );

  const isRoomTakenByOtherDoctor = useCallback(
    (room, dateISO, start, end, currentDoctor) => {
      for (const [doc, arr] of Object.entries(slotsByDoctor)) {
        if (doc === currentDoctor) continue;
        for (const s of arr || []) {
          if (
            s.room === room &&
            s.date === dateISO &&
            overlaps(s.start, s.end, start, end)
          ) {
            return true;
          }
        }
      }
      return false;
    },
    [slotsByDoctor]
  );

  const rangeAllFreeFor = useCallback(
    (doctorName, dateISO, start, end) => {
      if (blockedDates.includes(dateISO)) return false;
      const s = timeToIdx(start);
      const e = timeToIdx(end);
      if (!(TIME_SLOTS.includes(start) && TIME_SLOTS.includes(end))) return false;
      if (e <= s) return false;
      for (let i = s; i < e; i++) {
        const t = TIME_SLOTS[i];
        if (isBusyFor(doctorName, dateISO, t)) return false;
        if (isBlockedByGeneral(doctorName, dateISO, t)) return false;
      }
      return true;
    },
    [blockedDates, isBusyFor, isBlockedByGeneral]
  );

  const addSlot = useCallback((doctorName, slot) => {
    setSlotsByDoctor((prev) => ({
      ...prev,
      [doctorName]: [...(prev[doctorName] || []), slot],
    }));
  }, []);

  const removeSlotAtIndex = useCallback((doctorName, index) => {
    setSlotsByDoctor((prev) => {
      const arr = [...(prev[doctorName] || [])];
      arr.splice(index, 1);
      return { ...prev, [doctorName]: arr };
    });
  }, []);

  const updateSlotRoom = useCallback((doctorName, index, room) => {
    setSlotsByDoctor((prev) => {
      const arr = [...(prev[doctorName] || [])];
      arr[index] = { ...arr[index], room };
      return { ...prev, [doctorName]: arr };
    });
  }, []);

  const addPersonalBlock = useCallback((block) => {
    setPersonalBlocks((prev) => [...prev, block]);
  }, []);

  const addGeneralBlock = useCallback((block) => {
    setGeneralBlocks((prev) => [...prev, block]);
  }, []);

  return {
    // datos base
    TIME_SLOTS,
    ROOMS,

    // estado crudo
    slotsByDoctor,
    personalBlocks,
    generalBlocks,
    blockedDates,

    // helpers
    getSlotsFor,
    isBusyFor,
    isBlockedByPersonal,
    isBlockedByGeneral,
    isRoomTakenByOtherDoctor,
    rangeAllFreeFor,

    // mutadores
    addSlot,
    removeSlotAtIndex,
    updateSlotRoom,
    addPersonalBlock,
    addGeneralBlock,
  };
}
