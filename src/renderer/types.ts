import {
  LayoutDashboard,
  Music,
  CalendarClock,
  Scissors,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export type SectionId =
  | 'dashboard'
  | 'bell-sounds'
  | 'schedule'
  | 'shortened'
  | 'settings';

export interface NavItem {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Главная',
    icon: LayoutDashboard,
    description: 'Обзор и статус',
  },
  {
    id: 'bell-sounds',
    label: 'Звонки',
    icon: Music,
    description: 'Музыка на звонок',
  },
  {
    id: 'schedule',
    label: 'Расписание',
    icon: CalendarClock,
    description: 'Время звонков по дням',
  },
  {
    id: 'shortened',
    label: 'Сокращённые уроки',
    icon: Scissors,
    description: 'Особое расписание',
  },
  {
    id: 'settings',
    label: 'Настройки',
    icon: Settings,
    description: 'Автозапуск и общее',
  },
];

export interface BellTime {
  id: string;
  label: string;
  time: string;
  type: 'start' | 'end';
  trackId?: string;
  startOffsetSec?: number;
  durationSec?: number;
}

export interface DaySchedule {
  day: string;
  dayShort: string;
  enabled: boolean;
  bells: BellTime[];
}

export const daysOfWeek = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
];

export const defaultBells: BellTime[] = [
  { id: 'b-1', label: '1 Урок — Начало', time: '08:30', type: 'start' },
  { id: 'b-2', label: '1 Урок — Конец', time: '09:15', type: 'end' },
  { id: 'b-3', label: '2 Урок — Начало', time: '09:25', type: 'start' },
  { id: 'b-4', label: '2 Урок — Конец', time: '10:10', type: 'end' },
  { id: 'b-5', label: '3 Урок — Начало', time: '10:25', type: 'start' },
  { id: 'b-6', label: '3 Урок — Конец', time: '11:10', type: 'end' },
  { id: 'b-7', label: '4 Урок — Начало', time: '11:30', type: 'start' },
  { id: 'b-8', label: '4 Урок — Конец', time: '12:15', type: 'end' },
  { id: 'b-9', label: '5 Урок — Начало', time: '12:30', type: 'start' },
  { id: 'b-10', label: '5 Урок — Конец', time: '13:15', type: 'end' },
  { id: 'b-11', label: '6 Урок — Начало', time: '13:25', type: 'start' },
  { id: 'b-12', label: '6 Урок — Конец', time: '14:10', type: 'end' },
];

export const defaultShortenedBells: BellTime[] = [
  { id: 'sb-1', label: '1 Урок — Начало', time: '08:30', type: 'start' },
  { id: 'sb-2', label: '1 Урок — Конец', time: '09:05', type: 'end' },
  { id: 'sb-3', label: '2 Урок — Начало', time: '09:15', type: 'start' },
  { id: 'sb-4', label: '2 Урок — Конец', time: '09:50', type: 'end' },
  { id: 'sb-5', label: '3 Урок — Начало', time: '10:05', type: 'start' },
  { id: 'sb-6', label: '3 Урок — Конец', time: '10:40', type: 'end' },
  { id: 'sb-7', label: '4 Урок — Начало', time: '10:55', type: 'start' },
  { id: 'sb-8', label: '4 Урок — Конец', time: '11:30', type: 'end' },
];

export function normalizeTime(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return timeStr.trim();
  const h = parts[0].padStart(2, '0');
  const m = parts[1].padStart(2, '0');
  return `${h}:${m}`;
}

export interface MusicTrack {
  id: string;
  name: string;
  duration: string;
  durationSec?: number;
  startOffsetSec?: number;
  playDurationSec?: number;
  selected: boolean;
  filePath?: string;
  isDefault?: boolean;
  fileType?: string;
}

export const defaultBuiltInTracks: MusicTrack[] = [
  {
    id: 't1',
    name: 'Классический школьный звонок',
    duration: '0:06',
    durationSec: 6,
    filePath: 'classic_bell.wav',
    selected: true,
    isDefault: true,
  },
  {
    id: 't2',
    name: 'Мелодичный перезвон (Вестминстер)',
    duration: '0:05',
    durationSec: 5,
    filePath: 'melodic_chime.wav',
    selected: false,
    isDefault: true,
  },
  {
    id: 't3',
    name: 'Мягкий школьный гонг',
    duration: '0:05',
    durationSec: 5,
    filePath: 'gentle_gong.wav',
    selected: false,
    isDefault: true,
  },
  {
    id: 't4',
    name: 'Современная маримба',
    duration: '0:04',
    durationSec: 4,
    filePath: 'upbeat_marimba.wav',
    selected: false,
    isDefault: true,
  },
];
