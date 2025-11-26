import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  User2,
  ShieldBan,
  Lock,
  RotateCcw,
  Pencil,
  Sun,
  Moon,
} from 'lucide-react';
import { DAYS, MONTHS } from '../../constants/dates';
import {
  ALL_DOCTORS,
  DOCTOR_CC,
  DOCTORS,
  SPECIALTY_OF_DOCTOR,
} from '../../constants/doctors';
import { ROOMS } from '../../constants/rooms';
import { SPECIALTIES } from '../../constants/specialties';
import {
  TIME_SLOTS,
  cellEnd,
  fmtTime12,
  idxToTime,
  overlaps,
  timeToIdx,
} from '../../utils/timeUtils';

import CalendarSidebar from './CalendarSidebar';
import MonthlySummaryCard from './MonthlySummaryCard';
import WeeklyGrid from './WeeklyGrid';

import DashboardWrapper from '../dashboard/DashboardWrapper';
import CreateSlotModal from '../modals/CreateSlotModal';
import PersonalBlockModal from '../modals/PersonalBlockModal';
import ConfirmPersonalBlockModal from '../modals/ConfirmPersonalBlockModal';
import EditSlotModal from '../modals/EditSlotModal';
import GeneralBlockModal from '../modals/GeneralBlockModal';

// ================== Datos base ==================
const pill = {
  FREE: 'bg-green-600 text-white',
  BUSY: 'bg-blue-600 text-white',
  BLOCKED: 'bg-red-600 text-white',
};

const REFERENCE_MONTHLY_SLOTS = 320; // 160 horas mensuales en bloques de 30 minutos
const WEEKLY_MAX_SLOTS = 80; // 40 horas semanales en bloques de 30 minutos

// ================== Utilidades ==================
const fmtDateLong = (iso) => {
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

// ================== Componente principal ==================
export default function AgendaHU01Coordinator({ role = 'coordinator' }) {
  // Tema
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('agenda_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('agenda_theme', dark ? 'dark' : 'light');
  }, [dark]);

  const themeRoot = dark
    ? 'bg-slate-900 text-slate-100'
    : 'bg-white text-gray-900';
  const themeCard = dark
    ? 'bg-slate-800 border-slate-700'
    : 'bg-white border-gray-200';
  const themeMuted = dark ? 'text-slate-300' : 'text-gray-600';
  const themeHead = dark ? 'bg-slate-800' : 'bg-gray-50';

  // Fecha / calendario
  const today = new Date();
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const yearOptions = useMemo(
    () => [currentYear - 1, currentYear, currentYear + 1],
    [currentYear]
  );

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today);

  const setMonthYear = (newYear, newMonth) => {
    const safeMonth = Math.min(11, Math.max(0, newMonth));
    const base = new Date(newYear, safeMonth, 1);
    setYear(base.getFullYear());
    setMonth(base.getMonth());
    setSelectedDay(base);
  };

  const monthMatrix = useMemo(() => {
    const first = new Date(year, month, 1);
    const start = new Date(first);
    const off = (first.getDay() + 6) % 7;
    start.setDate(first.getDate() - off);
    return Array.from({ length: 6 }, (_, r) =>
      Array.from({ length: 7 }, (_, c) => {
        const d = new Date(start);
        d.setDate(start.getDate() + r * 7 + c);
        return d;
      })
    );
  }, [year, month]);

  const weekDays = useMemo(() => {
    const s = new Date(selectedDay);
    const off = (s.getDay() + 6) % 7;
    s.setDate(s.getDate() - off);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      return d;
    });
  }, [selectedDay]);

  const goPrevWeek = () => {
    const d = new Date(selectedDay);
    d.setDate(d.getDate() - 7);
    setSelectedDay(d);
  };

  const goNextWeek = () => {
    const d = new Date(selectedDay);
    d.setDate(d.getDate() + 7);
    setSelectedDay(d);
  };

  const goToday = () => {
    const d = new Date();
    setMonthYear(d.getFullYear(), d.getMonth());
  };

  useEffect(() => {
    const d = new Date(selectedDay);
    if (d.getFullYear() !== year || d.getMonth() !== month) {
      setYear(d.getFullYear());
      setMonth(d.getMonth());
    }
  }, [selectedDay, year, month]);

  const handleMonthChange = (value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    setMonthYear(year, parsed);
  };

  const handleYearChange = (value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    setMonthYear(parsed, month);
  };

  // Filtros
  const [spec, setSpec] = useState('Medicina interna');
  const [doctor, setDoctor] = useState('');
  const ready = Boolean(spec && doctor);

  useEffect(() => {
    const docs = DOCTORS[spec] || [];
    if (!docs.includes(doctor)) {
      setDoctor(docs[0] || '');
    }
  }, [spec]); // eslint-disable-line react-hooks/exhaustive-deps

  // Estado franjas / bloqueos
  const [slotsByDoctor, setSlotsByDoctor] = useState({});
  const getSlotsFor = (doctorName) => slotsByDoctor[doctorName] || [];

  const [personalBlocks, setPersonalBlocks] = useState([]);
  const [generalBlocks, setGeneralBlocks] = useState([]);
  const [blockedDates] = useState([]);

  const allDoctors = ALL_DOCTORS;

  // Tiempo / validación
  const isPastWeek = (dateISO) => {
    const d = new Date(dateISO);
    const t = new Date();
    d.setHours(0, 0, 0, 0);
    t.setHours(0, 0, 0, 0);
    return d.getTime() < t.getTime();
  };

  const getSlotLength = (start, end) =>
    Math.max(0, timeToIdx(end || start) - timeToIdx(start || '08:00'));

  const isBusy = (dateISO, t) =>
    getSlotsFor(doctor).some(
      (s) => s.date === dateISO && overlaps(s.start, s.end, t, cellEnd(t))
    );

  const getSlotAt = (doctorName, dateISO, t) => {
    const arr = getSlotsFor(doctorName);
    return arr.find(
      (s) => s.date === dateISO && overlaps(s.start, s.end, t, cellEnd(t))
    );
  };

  const isTimeWithin = (t, startT, endT) =>
    timeToIdx(t) >= timeToIdx(startT) && timeToIdx(t) < timeToIdx(endT);

  const isBlockedByPersonal = (doctorName, dateISO) => {
    const cc = DOCTOR_CC[doctorName];
    return personalBlocks.some(
      (b) => b.cc === cc && dateISO >= b.start && dateISO <= b.end
    );
  };

  const isBlockedByGeneral = (doctorName, dateISO, time) => {
    if (isBlockedByPersonal(doctorName, dateISO)) return false;
    return generalBlocks.some((g) => {
      if (!(dateISO >= g.startDate && dateISO <= g.endDate)) return false;
      const s = g.startTime || '08:00';
      const e = g.endTime || '18:00';
      if (!isTimeWithin(time, s, e)) return false;
      if (g.scope === 'ALL') return true;
      if (g.scope === 'SPECIALTY')
        return (DOCTORS[g.specialty] || []).includes(doctorName);
      if (g.scope === 'MANUAL') return (g.doctors || []).includes(doctorName);
      return false;
    });
  };

  const getWeekBounds = (dateISO) => {
    const d = new Date(dateISO);
    const off = (d.getDay() + 6) % 7;
    const start = new Date(d);
    start.setDate(d.getDate() - off);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      startISO: start.toISOString().slice(0, 10),
      endISO: end.toISOString().slice(0, 10),
    };
  };

  const getWeeklySlots = (doctorName, startISO, endISO) =>
    getSlotsFor(doctorName)
      .filter((s) => s.date >= startISO && s.date <= endISO)
      .reduce((acc, s) => acc + getSlotLength(s.start, s.end), 0);

  const isRoomTakenByOtherDoctor = (
    room,
    dateISO,
    start,
    end,
    currentDoctor
  ) => {
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
  };

  const rangeAllFree = (dateISO, start, end) => {
    if (blockedDates.includes(dateISO)) return false;
    const s = timeToIdx(start);
    const e = timeToIdx(end);
    if (!(TIME_SLOTS.includes(start) && TIME_SLOTS.includes(end))) return false;
    if (e <= s) return false;
    for (let i = s; i < e; i++) {
      const t = TIME_SLOTS[i];
      if (isBusy(dateISO, t)) return false;
      if (isBlockedByGeneral(doctor, dateISO, t)) return false;
    }
    return true;
  };

  const canCreateSlot = (date, start, end, room) => {
    if (!ready || isPastWeek(date)) return false;
    if (!rangeAllFree(date, start, end)) return false;
    if (room && isRoomTakenByOtherDoctor(room, date, start, end, doctor))
      return false;
    return true;
  };

  // utilidades por otro médico
  const isBusyFor = (doctorName, dateISO, t) =>
    (slotsByDoctor[doctorName] || []).some(
      (s) => s.date === dateISO && overlaps(s.start, s.end, t, cellEnd(t))
    );

  const rangeAllFreeFor = (doctorName, dateISO, start, end) => {
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
  };

  const findAvailableRoom = (dateISO, start, end, targetDoctor) => {
    for (const r of ROOMS) {
      if (!isRoomTakenByOtherDoctor(r, dateISO, start, end, targetDoctor)) {
        return r;
      }
    }
    return null;
  };

  const findReassignCandidate = (
    specialty,
    sourceDoctor,
    dateISO,
    start,
    end,
    preferredRoom
  ) => {
    const candidates = (DOCTORS[specialty] || []).filter(
      (d) => d !== sourceDoctor
    );
    for (const cand of candidates) {
      if (isBlockedByPersonal(cand, dateISO)) continue;
      if (!rangeAllFreeFor(cand, dateISO, start, end)) continue;

      let preferredFree = true;
      if (preferredRoom) {
        for (const [doc, arr] of Object.entries(slotsByDoctor)) {
          if (doc === cand) continue;
          for (const s of arr || []) {
            const isSourceSameSlot =
              doc === sourceDoctor &&
              s.date === dateISO &&
              s.room === preferredRoom &&
              s.start === start &&
              s.end === end;

            if (isSourceSameSlot) continue;

            if (
              s.room === preferredRoom &&
              s.date === dateISO &&
              overlaps(s.start, s.end, start, end)
            ) {
              preferredFree = false;
              break;
            }
          }
          if (!preferredFree) break;
        }
      }

      if (preferredRoom && preferredFree) {
        return { doctor: cand, room: preferredRoom };
      }

      const room = findAvailableRoom(dateISO, start, end, cand);
      if (!room) continue;
      return { doctor: cand, room };
    }
    return null;
  };

  const isSameSlot = (a, b) =>
    a &&
    b &&
    a.date === b.date &&
    a.start === b.start &&
    a.end === b.end &&
    a.room === b.room;

  // Drag / selección de franja
  const [drag, setDrag] = useState({
    active: false,
    date: null,
    startIdx: -1,
    endIdx: -1,
  });
  const [selectedRange, setSelectedRange] = useState(null);
  const [selectedExisting, setSelectedExisting] = useState(null);

  useEffect(() => {
    setSelectedRange(null);
    setSelectedExisting(null);
    setDrag({ active: false, date: null, startIdx: -1, endIdx: -1 });
  }, [selectedDay, doctor]);

  const onMouseDownCell = (dateISO, rowIdx, time, status, selectable) => {
    if (!ready) return;
    if (status === 'BUSY') {
      const arr = getSlotsFor(doctor);
      const idx = arr.findIndex(
        (s) => s.date === dateISO && isTimeWithin(time, s.start, s.end)
      );
      if (idx !== -1) {
        setSelectedRange(null);
        setSelectedExisting({ index: idx, ...arr[idx] });
      }
      return;
    }
    if (!selectable) return;
    setSelectedExisting(null);
    setSelectedRange(null);
    setDrag({ active: true, date: dateISO, startIdx: rowIdx, endIdx: rowIdx });
  };

  const onMouseEnterCell = (dateISO, rowIdx, selectable) => {
    if (!drag.active) return;
    if (dateISO !== drag.date) return;
    if (!selectable) return;
    setDrag((d) => ({ ...d, endIdx: rowIdx }));
  };

  const finishDrag = () => {
    if (!drag.active || !drag.date) return;
    const a = Math.min(drag.startIdx, drag.endIdx);
    const b = Math.max(drag.startIdx, drag.endIdx);
    const start = idxToTime(a);
    const end = idxToTime(Math.min(b + 1, TIME_SLOTS.length - 1));
    if (canCreateSlot(drag.date, start, end))
      setSelectedRange({ date: drag.date, start, end });
    else setSelectedRange(null);
    setDrag({ active: false, date: null, startIdx: -1, endIdx: -1 });
  };

  useEffect(() => {
    const up = () => finishDrag();
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  });

  // Crear / reset / editar franja
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ start: '', end: '', room: '' });

  const openCreateFromSelection = () => {
    if (role !== 'coordinator')
      return alert(
        'Acceso restringido: solo el coordinador puede crear franjas.'
      );
    if (!ready) return alert('Selecciona una especialidad y un médico.');
    if (!selectedRange)
      return alert('Selecciona un rango libre arrastrando en la agenda.');
    setForm({
      start: selectedRange.start,
      end: selectedRange.end,
      room: form.room,
    });
    setCreating(true);
  };

  const handleSave = () => {
    if (role !== 'coordinator')
      return alert('Solo el coordinador puede crear franjas.');
    if (!ready) return alert('Selecciona una especialidad y un médico.');
    const date = selectedRange?.date;
    if (!date) return alert('Selecciona un rango libre.');
    if (!form.start || !form.end)
      return alert('Debe seleccionar hora de inicio y fin.');
    if (!form.room) return alert('Debe asignar un consultorio.');

    if (!canCreateSlot(date, form.start, form.end, form.room)) {
      const taken = isRoomTakenByOtherDoctor(
        form.room,
        date,
        form.start,
        form.end,
        doctor
      );
      if (taken)
        return alert(
          `El consultorio ${form.room} ya está asignado a ese horario para otro médico.`
        );
      return alert(
        'No es posible crear la franja: semana pasada, bloqueos, solapes o bloques inválidos.'
      );
    }

    const { startISO, endISO } = getWeekBounds(date);
    const weeklyLoad = getWeeklySlots(doctor, startISO, endISO);
    const newSlotSize = getSlotLength(form.start, form.end);
    if (weeklyLoad + newSlotSize > WEEKLY_MAX_SLOTS) {
      return alert(
        'Se supera el límite de 40 horas semanales (80 franjas de 30 minutos). Ajusta la franja para no exceder el máximo recomendado.'
      );
    }

    setSlotsByDoctor((prev) => ({
      ...prev,
      [doctor]: [
        ...(prev[doctor] || []),
        { date, start: form.start, end: form.end, room: form.room },
      ],
    }));
    setCreating(false);
    setSelectedRange(null);
    setForm({ start: '', end: '', room: '' });
  };

  const canReset =
    !!selectedExisting &&
    role === 'coordinator' &&
    !isPastWeek(selectedExisting.date) &&
    ready;

  const handleReset = () => {
    if (!canReset) return;
    const { index } = selectedExisting;
    setSlotsByDoctor((prev) => {
      const arr = [...(prev[doctor] || [])];
      arr.splice(index, 1);
      return { ...prev, [doctor]: arr };
    });
    setSelectedExisting(null);
  };

  const [editing, setEditing] = useState(false);
  const [editRoom, setEditRoom] = useState('');
  const canEdit = canReset;

  const openEditModal = () => {
    if (!canEdit) return;
    setEditRoom(selectedExisting?.room || '');
    setEditing(true);
  };

  const saveEditRoom = () => {
    if (!canEdit) return;
    if (!editRoom) return alert('Selecciona un consultorio.');

    const { index, date, start, end } = selectedExisting;
    if (isRoomTakenByOtherDoctor(editRoom, date, start, end, doctor)) {
      return alert(
        `El consultorio ${editRoom} ya está asignado en ese horario para otro médico.`
      );
    }

    setSlotsByDoctor((prev) => {
      const arr = [...(prev[doctor] || [])];
      arr[index] = { ...arr[index], room: editRoom };
      return { ...prev, [doctor]: arr };
    });
    setSelectedExisting((se) => (se ? { ...se, room: editRoom } : se));
    setEditing(false);
    alert('Se editó correctamente el consultorio.');
  };

  // BLOQUEO PERSONAL -----------------------------------
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState({
    cc: '',
    type: 'VACACIONES',
    start: '',
    end: '',
  });

  const [confirmPersonal, setConfirmPersonal] = useState({
    show: false,
    data: null,
  });

  const openBlockModal = () => {
    if (role !== 'coordinator')
      return alert(
        'Acceso restringido: solo el coordinador puede registrar bloqueos.'
      );
    if (!ready) return alert('Selecciona una especialidad y un médico.');
    setBlockForm({
      cc: DOCTOR_CC[doctor] || '',
      type: 'VACACIONES',
      start: '',
      end: '',
    });
    setShowBlockModal(true);
  };

  const saveBlock = () => {
    if (role !== 'coordinator')
      return alert('Solo el coordinador puede registrar bloqueos.');
    const { cc, type, start, end } = blockForm;
    if (!cc) return alert('La cédula del médico es obligatoria.');
    if (!(type === 'VACACIONES' || type === 'INCAPACIDAD'))
      return alert('Debe seleccionar tipo de bloqueo.');
    if (!start || !end) return alert('Debe seleccionar fecha de inicio y fin.');
    if (start > end)
      return alert('La fecha de inicio debe ser anterior o igual a la de fin.');
    const todayISO = new Date().toISOString().slice(0, 10);
    if (start < todayISO)
      return alert('No se permite crear bloqueos en fechas anteriores a hoy.');
    const overlap = personalBlocks.some(
      (b) => b.cc === cc && !(end < b.start || start > b.end)
    );
    if (overlap) return alert('Ya existe un bloqueo para parte de ese rango.');

    const srcDoctor = doctor;
    const srcSpec = spec;
    const doctorSlots = getSlotsFor(srcDoctor) || [];
    const conflicts = doctorSlots.filter(
      (s) => !(s.date < start || s.date > end)
    );

    const conflictsWithSuggestions = conflicts.map((s) => {
      const suggestion = findReassignCandidate(
        srcSpec,
        srcDoctor,
        s.date,
        s.start,
        s.end,
        s.room
      );
      return { ...s, suggestion };
    });

    setShowBlockModal(false);
    setConfirmPersonal({
      show: true,
      data: {
        cc,
        type,
        start,
        end,
        doctor: srcDoctor,
        spec: srcSpec,
        createdAt: todayISO,
        conflicts: conflictsWithSuggestions,
      },
    });
  };

  const doConfirmPersonal = () => {
    const d = confirmPersonal.data;
    if (!d) return;
    setPersonalBlocks([
      ...personalBlocks,
      { cc: d.cc, type: d.type, start: d.start, end: d.end },
    ]);
    setConfirmPersonal({ show: false, data: null });
  };

  const doConfirmPersonalReassign = () => {
    const d = confirmPersonal.data;
    if (!d) return;
    const srcDoctor = d.doctor;
    const conflicts = d.conflicts || [];

    setSlotsByDoctor((prev) => {
      const next = { ...prev };
      const srcArr = [...(next[srcDoctor] || [])];

      const filteredSrc = srcArr.filter(
        (slot) => !conflicts.some((c) => isSameSlot(slot, c))
      );
      next[srcDoctor] = filteredSrc;

      for (const c of conflicts) {
        if (c.suggestion && c.suggestion.doctor && c.suggestion.room) {
          const target = c.suggestion.doctor;
          const tArr = [...(next[target] || [])];
          tArr.push({
            date: c.date,
            start: c.start,
            end: c.end,
            room: c.suggestion.room,
          });
          next[target] = tArr;
        }
      }
      return next;
    });

    setPersonalBlocks([
      ...personalBlocks,
      { cc: d.cc, type: d.type, start: d.start, end: d.end },
    ]);
    const reassignCount = (d.conflicts || []).filter(
      (c) => c.suggestion
    ).length;
    const cancelCount = (d.conflicts || []).length - reassignCount;
    alert(
      `Bloqueo aplicado. Reasignadas ${reassignCount} franja(s); canceladas ${cancelCount}.`
    );
    setConfirmPersonal({ show: false, data: null });
  };

  const doConfirmPersonalCancel = () => {
    const d = confirmPersonal.data;
    if (!d) return;
    const srcDoctor = d.doctor;
    const conflicts = d.conflicts || [];

    setSlotsByDoctor((prev) => {
      const next = { ...prev };
      const srcArr = [...(next[srcDoctor] || [])];
      const filteredSrc = srcArr.filter(
        (slot) => !conflicts.some((c) => isSameSlot(slot, c))
      );
      next[srcDoctor] = filteredSrc;
      return next;
    });

    setPersonalBlocks([
      ...personalBlocks,
      { cc: d.cc, type: d.type, start: d.start, end: d.end },
    ]);
    alert(
      `Bloqueo aplicado. Canceladas ${conflicts.length} franja(s) en conflicto.`
    );
    setConfirmPersonal({ show: false, data: null });
  };

  // BLOQUEO GENERAL -----------------------------------
  const [showGeneralModal, setShowGeneralModal] = useState(false);
  const [generalForm, setGeneralForm] = useState({
    scope: 'ALL',
    specialty: SPECIALTIES[0],
    doctors: [],
    eventType: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
  });

  const openGeneralModal = () => {
    if (role !== 'coordinator')
      return alert(
        'Acceso restringido: solo el coordinador puede registrar bloqueos generales.'
      );
    setShowGeneralModal(true);
  };

  const saveGeneralBlock = () => {
    if (role !== 'coordinator')
      return alert('Solo el coordinador puede registrar bloqueos.');
    const {
      scope,
      specialty,
      doctors,
      eventType,
      startDate,
      endDate,
      startTime,
      endTime,
    } = generalForm;

    if (!startDate || !endDate)
      return alert('Debe seleccionar fecha de inicio y fin.');
    if (startDate > endDate)
      return alert('La fecha de inicio debe ser anterior o igual a la de fin.');
    const todayISO = new Date().toISOString().slice(0, 10);
    if (startDate < todayISO)
      return alert(
        'No se permite crear bloqueos generales en fechas anteriores a hoy.'
      );
    if (!eventType.trim())
      return alert('Debe indicar un tipo de evento (motivo del bloqueo).');

    if (scope === 'SPECIALTY' && !specialty)
      return alert('Debe seleccionar una especialidad.');
    if (scope === 'MANUAL' && (!doctors || doctors.length === 0))
      return alert('Debe seleccionar al menos un médico para el bloqueo.');

    setGeneralBlocks([
      ...generalBlocks,
      {
        scope,
        specialty,
        doctors,
        eventType: eventType.trim(),
        startDate,
        endDate,
        startTime,
        endTime,
      },
    ]);

    setShowGeneralModal(false);
    setGeneralForm({
      scope: 'ALL',
      specialty: SPECIALTIES[0],
      doctors: [],
      eventType: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
    });
    alert('Bloqueo general creado correctamente.');
  };

  // ========= Dashboard (rangos y métricas globales) =========
  const [dashTime, setDashTime] = useState('month'); // week | month | year
  const [dashSpec, setDashSpec] = useState('ALL');
  const [dashSeriesType, setDashSeriesType] = useState('PERSONAL');

  const dashboardRange = useMemo(() => {
    const base = new Date(selectedDay);
    base.setHours(0, 0, 0, 0);
    let start = new Date(base);
    let end = new Date(base);

    if (dashTime === 'week') {
      const off = (base.getDay() + 6) % 7;
      start.setDate(base.getDate() - off);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else if (dashTime === 'month') {
      start = new Date(base.getFullYear(), base.getMonth(), 1);
      end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    } else {
      start = new Date(base.getFullYear(), 0, 1);
      end = new Date(base.getFullYear(), 11, 31);
    }

    const toISO = (d) => d.toISOString().slice(0, 10);
    const days = [];
    const cur = new Date(start);
    while (cur <= end) {
      days.push(toISO(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return { start: toISO(start), end: toISO(end), days };
  }, [selectedDay, dashTime]);

  const timeSeries = useMemo(() => {
    const { days } = dashboardRange;
    return days.map((d) => {
      const personalCount = personalBlocks.filter(
        (b) => !(b.end < d || b.start > d)
      ).length;
      const generalCount = generalBlocks.filter(
        (g) => !(g.endDate < d || g.startDate > d)
      ).length;
      const value =
        dashSeriesType === 'PERSONAL' ? personalCount : generalCount;
      const date = new Date(d);
      return {
        x: d,
        value,
        label: `${date.getDate()}/${date.getMonth() + 1}`,
      };
    });
  }, [dashboardRange, personalBlocks, generalBlocks, dashSeriesType]);

  const barPerSpecialty = useMemo(() => {
    const { days } = dashboardRange;
    const indexBySpec = Object.fromEntries(
      SPECIALTIES.map((s, i) => [s, i])
    );
    const result = SPECIALTIES.map((sp) => ({ sp, count: 0 }));

    days.forEach((dateISO) => {
      TIME_SLOTS.forEach((t) => {
        Object.entries(slotsByDoctor).forEach(([doc, arr]) => {
          const specDoc = SPECIALTY_OF_DOCTOR[doc];
          if (!specDoc) return;
          const idxSpec = indexBySpec[specDoc];
          if (idxSpec == null) return;
          const busy = (arr || []).some(
            (s) => s.date === dateISO && overlaps(s.start, s.end, t, cellEnd(t))
          );
          if (busy) {
            result[idxSpec].count += 1;
          }
        });
      });
    });

    return result;
  }, [dashboardRange, slotsByDoctor]);

  const pieCounts = useMemo(() => {
    const { start, end } = dashboardRange;

    const persInRange = personalBlocks.filter(
      (b) => !(b.end < start || b.start > end)
    );
    const genInRange = generalBlocks.filter(
      (g) => !(g.endDate < start || g.startDate > end)
    );

    let v = 0;
    let i = 0;
    persInRange.forEach((b) => {
      if (b.type === 'VACACIONES') v += 1;
      else if (b.type === 'INCAPACIDAD') i += 1;
    });
    const g = genInRange.length;

    const total = v + i + g || 1;
    const pct = {
      VACACIONES: Math.round((v * 100) / total),
      INCAPACIDAD: Math.round((i * 100) / total),
      GENERAL: Math.round((g * 100) / total),
    };

    return { raw: { VACACIONES: v, INCAPACIDAD: i, GENERAL: g }, pct };
  }, [dashboardRange, personalBlocks, generalBlocks]);

  const roomStats = useMemo(() => {
    const { days } = dashboardRange;
    const totalPerRoom = days.length * TIME_SLOTS.length;

    const rows = ROOMS.map((room) => {
      let busy = 0;
      Object.values(slotsByDoctor).forEach((arr) => {
        (arr || []).forEach((s) => {
          if (s.room === room && days.includes(s.date)) {
            busy += Math.max(0, timeToIdx(s.end) - timeToIdx(s.start));
          }
        });
      });
      const free = Math.max(0, totalPerRoom - busy);
      const pct = totalPerRoom
        ? Math.round((busy * 100) / totalPerRoom)
        : 0;
      return { room, free, busy, pct };
    });

    const occupied = rows.filter((r) => r.busy > 0).length;
    return { donut: { occupied, free: ROOMS.length - occupied }, rows };
  }, [dashboardRange, slotsByDoctor]);

  // ========= Resumen mensual del médico =========
  const [lastOccLevel, setLastOccLevel] = useState(null);
  const [occAlert, setOccAlert] = useState(null);

  const monthlyMetrics = useMemo(() => {
    if (!ready || !doctor) return null;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const cur = new Date(firstDay);
    while (cur <= lastDay) {
      days.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }

    let assigned = 0;
    let blockedPersonal = 0;
    let blockedGeneral = 0;
    let free = 0;

    days.forEach((dateISO) => {
      TIME_SLOTS.forEach((t) => {
        if (isBusyFor(doctor, dateISO, t)) {
          assigned += 1;
        } else if (isBlockedByPersonal(doctor, dateISO)) {
          blockedPersonal += 1;
        } else if (isBlockedByGeneral(doctor, dateISO, t)) {
          blockedGeneral += 1;
        } else {
          free += 1;
        }
      });
    });

    const referenceSlots = REFERENCE_MONTHLY_SLOTS;
    const pct = referenceSlots > 0 ? Math.round((assigned * 100) / referenceSlots) : 0;
    const available = Math.max(
      0,
      referenceSlots - assigned - blockedPersonal - blockedGeneral
    );

    let level = null;
    if (assigned === 0 && blockedPersonal === 0 && blockedGeneral === 0) {
      level = null;
    } else if (pct > 85) {
      level = 'HIGH';
    } else if (pct >= 60) {
      level = 'MEDIUM';
    } else {
      level = 'LOW';
    }

    return {
      assigned,
      blockedPersonal,
      blockedGeneral,
      free,
      pct,
      level,
      referenceSlots,
      available,
    };
  }, [ready, doctor, year, month, slotsByDoctor, personalBlocks, generalBlocks]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!monthlyMetrics || !doctor) return;

    if (!monthlyMetrics.level) {
      setLastOccLevel(null);
      return;
    }

    if (lastOccLevel && lastOccLevel !== monthlyMetrics.level) {
      setOccAlert({
        previous: lastOccLevel,
        level: monthlyMetrics.level,
        pct: monthlyMetrics.pct,
      });
    }
    setLastOccLevel(monthlyMetrics.level);
  }, [monthlyMetrics, doctor, lastOccLevel]);

  const weekBounds = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    return {
      startISO: start.toISOString().slice(0, 10),
      endISO: end.toISOString().slice(0, 10),
    };
  }, [weekDays]);

  const weeklyLoadSlots = useMemo(() => {
    if (!doctor || !weekBounds?.startISO) return 0;
    return getWeeklySlots(doctor, weekBounds.startISO, weekBounds.endISO);
  }, [doctor, weekBounds, slotsByDoctor]);

  const weeklyLoadHours = Math.round((weeklyLoadSlots / 2) * 10) / 10;

  const weeklyStatus = (() => {
    if (weeklyLoadSlots >= WEEKLY_MAX_SLOTS) return 'LÍMITE EXCEDIDO';
    if (weeklyLoadSlots >= WEEKLY_MAX_SLOTS * 0.85) return 'Cerca del límite';
    return 'Dentro del límite recomendado';
  })();

  const weeklyStatusColor =
    weeklyLoadSlots >= WEEKLY_MAX_SLOTS
      ? dark
        ? 'text-red-300'
        : 'text-red-600'
      : weeklyLoadSlots >= WEEKLY_MAX_SLOTS * 0.85
      ? dark
        ? 'text-amber-200'
        : 'text-amber-600'
      : dark
      ? 'text-emerald-200'
      : 'text-emerald-700';

  // ================== UI ==================
  const weekLabel = (() => {
    const start = weekDays[0];
    const end = weekDays[6];
    return `${start.getDate()} ${MONTHS[start.getMonth()].slice(
      0,
      3
    )} - ${end.getDate()} ${
      MONTHS[end.getMonth()]
    } ${end.getFullYear()}`;
  })();

  const docsForSpec = DOCTORS[spec] || [];

  return (
    <div className={`min-h-screen ${themeRoot} p-4 md:p-6`}>
      {/* Header */}
      <header
        className={`flex items-center justify-between border-b pb-3 mb-4 ${
          dark ? 'border-slate-700' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <CalendarRange className="w-5 h-5" />
          <h1 className="text-lg md:text-xl font-semibold">
            Visualización de agendas médicas
          </h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className={themeMuted}>
            Rol:{' '}
            <strong className={dark ? 'text-slate-100' : 'text-gray-900'}>
              {role === 'coordinator' ? 'Coordinador' : 'Otro'}
            </strong>
          </div>
          <User2 className="w-5 h-5" />
          <button
            aria-label="Cambiar tema"
            onClick={() => setDark((d) => !d)}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg border text-sm ${
              dark
                ? 'border-slate-600 hover:bg-slate-800'
                : 'border-gray-300 hover:bg-gray-100'
            }`}
            title={dark ? 'Cambiar a Claro' : 'Cambiar a Oscuro'}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {dark ? 'Claro' : 'Oscuro'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel izquierdo */}
        <aside className="lg:col-span-3">
          <CalendarSidebar
            dark={dark}
            themeCard={themeCard}
            themeMuted={themeMuted}
            year={year}
            month={month}
            setYear={setYear}
            setMonth={setMonth}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            monthMatrix={monthMatrix}
            MONTHS={MONTHS}
          />

          <MonthlySummaryCard
            role={role}
            ready={ready}
            doctor={doctor}
            month={month}
            year={year}
            MONTHS={MONTHS}
            monthlyMetrics={monthlyMetrics}
            themeCard={themeCard}
            themeMuted={themeMuted}
            dark={dark}
          />
        </aside>

        {/* Panel principal */}
        <section className="lg:col-span-9 space-y-4">
          {/* Controles superiores */}
          <div className={`rounded-xl border px-4 py-3 ${themeCard}`}>
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrevWeek}
                  className={`p-1 rounded border ${
                    dark ? 'border-slate-600' : 'border-gray-300'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={goNextWeek}
                  className={`p-1 rounded border ${
                    dark ? 'border-slate-600' : 'border-gray-300'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={goToday}
                  className={`ml-2 px-3 py-1 rounded text-xs border ${
                    dark
                      ? 'border-slate-600 hover:bg-slate-800'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Hoy
                </button>
              </div>
              <p className={`text-sm font-medium ${themeMuted}`}>
                Semana: <span className="text-sm font-semibold">{weekLabel}</span>
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs mb-1">Especialidad</label>
                <select
                  value={spec}
                  onChange={(e) => setSpec(e.target.value)}
                  className={`text-sm rounded-lg border px-3 py-2 ${
                    dark
                      ? 'bg-slate-900 border-slate-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1">Médico</label>
                <select
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  className={`text-sm rounded-lg border px-3 py-2 ${
                    dark
                      ? 'bg-slate-900 border-slate-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {docsForSpec.length === 0 && (
                    <option value="">(Sin médicos configurados)</option>
                  )}
                  {docsForSpec.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1" htmlFor="month-select">
                  Mes
                </label>
                <select
                  id="month-select"
                  value={month}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className={`text-sm rounded-lg border px-3 py-2 ${
                    dark
                      ? 'bg-slate-900 border-slate-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {MONTHS.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1" htmlFor="year-input">
                  Año
                </label>
                <select
                  id="year-input"
                  value={year}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className={`text-sm rounded-lg border px-3 py-2 ${
                    dark
                      ? 'bg-slate-900 border-slate-600'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ml-auto flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={openCreateFromSelection}
                  disabled={!selectedRange}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs border ${
                    dark
                      ? 'border-slate-600 hover:bg-slate-800'
                      : 'border-gray-300 hover:bg-gray-100'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Crear franja
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!canReset}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs border ${
                    dark
                      ? 'border-slate-600 hover:bg-slate-800'
                      : 'border-gray-300 hover:bg-gray-100'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                  title="Eliminar franja seleccionada"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restablecer
                </button>

                <button
                  type="button"
                  onClick={openEditModal}
                  disabled={!canEdit}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs border ${
                    dark
                      ? 'border-slate-600 hover:bg-slate-800'
                      : 'border-gray-300 hover:bg-gray-100'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                  title="Editar consultorio de la franja"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>

                <button
                  type="button"
                  onClick={openBlockModal}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs border ${
                    dark
                      ? 'border-amber-500 text-amber-200 hover:bg-slate-800'
                      : 'border-amber-500 text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  <ShieldBan className="w-4 h-4" />
                  Bloqueo personal
                </button>

                <button
                  type="button"
                  onClick={openGeneralModal}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs border ${
                    dark
                      ? 'border-red-500 text-red-200 hover:bg-slate-800'
                      : 'border-red-500 text-red-700 hover:bg-red-50'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Bloqueo general
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard / Agenda */}
          {!ready ? (
            role === 'coordinator' ? (
              <DashboardWrapper
                dark={dark}
                themeCard={themeCard}
                themeHead={themeHead}
                themeMuted={themeMuted}
                dashTime={dashTime}
                setDashTime={setDashTime}
                dashSpec={dashSpec}
                setDashSpec={setDashSpec}
                dashSeriesType={dashSeriesType}
                setDashSeriesType={setDashSeriesType}
                SPECIALTIES={SPECIALTIES}
                timeSeries={timeSeries}
                barPerSpecialty={barPerSpecialty}
                pieCounts={pieCounts}
                roomStats={roomStats}
                ROOMS={ROOMS}
              />
            ) : (
              <div className={`rounded-xl border p-8 ${themeCard}`}>
                <p className="text-sm">
                  Selecciona una especialidad y un médico en la parte superior
                  para ver la agenda semanal.
                </p>
              </div>
            )
          ) : (
            <>
              <div className={`rounded-xl border px-4 py-3 ${themeCard}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Carga semanal del médico</p>
                    <p className={`text-xs ${themeMuted}`}>
                      Total de horas asignadas en la semana seleccionada.
                      Límite recomendado: 40 horas (80 franjas de 30 minutos).
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {weeklyLoadHours} h / 40 h
                    </p>
                    <p className={`text-xs ${themeMuted}`}>
                      {weeklyLoadSlots} franjas de 30 minutos
                    </p>
                    <p className={`text-xs font-medium mt-1 ${weeklyStatusColor}`}>
                      {weeklyStatus}
                    </p>
                  </div>
                </div>
              </div>

              <WeeklyGrid
                dark={dark}
                themeCard={themeCard}
                themeHead={themeHead}
                themeMuted={themeMuted}
                DAYS={DAYS}
                MONTHS={MONTHS}
                TIME_SLOTS={TIME_SLOTS}
                weekDays={weekDays}
                doctor={doctor}
                blockedDates={blockedDates}
                drag={drag}
                selectedRange={selectedRange}
                onMouseDownCell={onMouseDownCell}
                onMouseEnterCell={onMouseEnterCell}
                finishDrag={finishDrag}
                timeToIdx={timeToIdx}
                isPastWeek={isPastWeek}
                isBusy={isBusy}
                isBlockedByPersonal={isBlockedByPersonal}
                isBlockedByGeneral={isBlockedByGeneral}
                getSlotAt={getSlotAt}
                pill={pill}
              />

              {role === 'coordinator' && (
                <DashboardWrapper
                  dark={dark}
                  themeCard={themeCard}
                  themeHead={themeHead}
                  themeMuted={themeMuted}
                  dashTime={dashTime}
                  setDashTime={setDashTime}
                  dashSpec={dashSpec}
                  setDashSpec={setDashSpec}
                  dashSeriesType={dashSeriesType}
                  setDashSeriesType={setDashSeriesType}
                  SPECIALTIES={SPECIALTIES}
                  timeSeries={timeSeries}
                  barPerSpecialty={barPerSpecialty}
                  pieCounts={pieCounts}
                  roomStats={roomStats}
                  ROOMS={ROOMS}
                />
              )}
            </>
          )}
        </section>
      </div>

      {/* Modales */}
      <CreateSlotModal
        open={creating}
        onClose={() => setCreating(false)}
        dark={dark}
        themeCard={themeCard}
        selectedRange={selectedRange}
        form={form}
        setForm={setForm}
        TIME_SLOTS={TIME_SLOTS}
        ROOMS={ROOMS}
        doctor={doctor}
        isRoomTakenByOtherDoctor={isRoomTakenByOtherDoctor}
        handleSave={handleSave}
      />

      <PersonalBlockModal
        open={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        dark={dark}
        themeCard={themeCard}
        themeMuted={themeMuted}
        blockForm={blockForm}
        setBlockForm={setBlockForm}
        DOCTOR_CC={DOCTOR_CC}
        doctor={doctor}
        onSave={saveBlock}
      />

      <ConfirmPersonalBlockModal
        open={confirmPersonal.show}
        onClose={() => setConfirmPersonal({ show: false, data: null })}
        confirmPersonal={confirmPersonal}
        fmtDateLong={fmtDateLong}
        fmtTime12={fmtTime12}
        themeCard={themeCard}
        themeMuted={themeMuted}
        dark={dark}
        doConfirmPersonal={doConfirmPersonal}
        doConfirmPersonalReassign={doConfirmPersonalReassign}
        doConfirmPersonalCancel={doConfirmPersonalCancel}
      />

      <EditSlotModal
        open={editing}
        onClose={() => setEditing(false)}
        dark={dark}
        themeCard={themeCard}
        selectedExisting={selectedExisting}
        editRoom={editRoom}
        setEditRoom={setEditRoom}
        ROOMS={ROOMS}
        saveEditRoom={saveEditRoom}
      />

      <GeneralBlockModal
        open={showGeneralModal}
        onClose={() => setShowGeneralModal(false)}
        dark={dark}
        themeCard={themeCard}
        themeMuted={themeMuted}
        generalForm={generalForm}
        setGeneralForm={setGeneralForm}
        SPECIALTIES={SPECIALTIES}
        TIME_SLOTS={TIME_SLOTS}
        allDoctors={allDoctors}
        onSave={saveGeneralBlock}
      />

      {/* Alerta de cambio de nivel de ocupación */}
      {occAlert && doctor && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`rounded-xl shadow-lg px-4 py-3 text-sm border ${
              dark
                ? 'bg-slate-800 border-slate-600'
                : 'bg-white border-gray-200'
            }`}
          >
            <p className="font-semibold mb-1">
              Cambio en el nivel de ocupación
            </p>
            <p className="mb-2">
              El médico <strong>{doctor}</strong> ahora tiene una ocupación{' '}
              <strong>
                {occAlert.level === 'HIGH'
                  ? 'ALTA'
                  : occAlert.level === 'MEDIUM'
                  ? 'MODERADA'
                  : 'BAJA'}
              </strong>{' '}
              ({occAlert.pct}%).{' '}
              {occAlert?.previous && (
                <span className={themeMuted}>
                  Antes: {occAlert.previous === 'HIGH'
                    ? 'Alta'
                    : occAlert.previous === 'MEDIUM'
                    ? 'Moderada'
                    : 'Baja'}
                </span>
              )}
            </p>
            <button
              onClick={() => setOccAlert(null)}
              className={`text-xs px-2 py-1 rounded border ${
                dark
                  ? 'border-slate-600 hover:bg-slate-700'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
