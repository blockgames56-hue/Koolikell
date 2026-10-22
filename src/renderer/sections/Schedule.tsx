import { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronDown,
  Play,
  Pause,
  Copy,
  Check,
  AlertTriangle,
  CalendarClock,
  Power,
} from 'lucide-react';
import { Toggle } from '@/components/Toggle';
import { AddBellModal } from '@/components/AddBellModal';
import { type DaySchedule, type BellTime, type MusicTrack } from '@/types';
import { type Translations } from '@/i18n';

interface ScheduleProps {
  schedules: DaySchedule[];
  onUpdate: (schedules: DaySchedule[]) => void;
  playingId: string | null;
  onTogglePlay: (id: string, bell?: BellTime) => void;
  tracks: MusicTrack[];
  defaultTrackId: string;
  t: Translations;
  shortenedEnabled?: boolean;
  onDisableShortened?: () => void;
  onNavigateToShortened?: () => void;
}

export function Schedule({
  schedules,
  onUpdate,
  playingId,
  onTogglePlay,
  tracks,
  defaultTrackId,
  t,
  shortenedEnabled,
  onDisableShortened,
  onNavigateToShortened,
}: ScheduleProps) {
  const currentDayOfWeek = new Date().getDay();
  const isoDayIdx = (currentDayOfWeek + 6) % 7;
  const todayIdx = isoDayIdx < schedules.length ? isoDayIdx : 0;
  const todayDayName = schedules[todayIdx]?.day ?? schedules[0]?.day ?? '';
  const [expandedDay, setExpandedDay] = useState<string>(todayDayName);
  const [copiedDay, setCopiedDay] = useState<string | null>(null);
  const [showRegularWhenShortened, setShowRegularWhenShortened] = useState<boolean>(false);

  // Modal state
  const [modalDay, setModalDay] = useState<string | null>(null);
  const [editingBell, setEditingBell] = useState<BellTime | null>(null);

  const toggleDay = (day: string) => setExpandedDay(expandedDay === day ? '' : day);

  const copyToWeekdays = (sourceDay: DaySchedule) => {
    const updated = schedules.map((s, idx) => {
      // Copy to Monday through Friday
      if (idx < 5 && s.day !== sourceDay.day) {
        return {
          ...s,
          enabled: true,
          bells: sourceDay.bells.map((b) => ({
            ...b,
            id: `bell-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          })),
        };
      }
      return s;
    });
    onUpdate(updated);
    setCopiedDay(sourceDay.day);
    setTimeout(() => setCopiedDay(null), 2500);
  };

  const updateDay = (dayName: string, updates: Partial<DaySchedule>) => {
    onUpdate(
      schedules.map((s) => (s.day === dayName ? { ...s, ...updates } : s)),
    );
  };

  const updateBell = (dayName: string, bellId: string, updates: Partial<BellTime>) => {
    const day = schedules.find((s) => s.day === dayName);
    if (!day) return;
    const updatedBells = day.bells.map((b) => (b.id === bellId ? { ...b, ...updates } : b));
    if (updates.time) {
      updatedBells.sort((a, b) => a.time.localeCompare(b.time));
    }
    updateDay(dayName, { bells: updatedBells });
  };

  const deleteBell = (dayName: string, bellId: string) => {
    const day = schedules.find((s) => s.day === dayName);
    if (!day) return;
    updateDay(dayName, { bells: day.bells.filter((b) => b.id !== bellId) });
  };

  const handleOpenAddModal = (dayName: string) => {
    setModalDay(dayName);
    setEditingBell(null);
  };

  const handleSaveBell = (savedBell: BellTime) => {
    if (!modalDay) return;
    const day = schedules.find((s) => s.day === modalDay);
    if (!day) return;

    const updatedBells = editingBell
      ? day.bells.map((b) => (b.id === savedBell.id ? savedBell : b))
      : [...day.bells, savedBell];
    updatedBells.sort((a, b) => a.time.localeCompare(b.time));
    updateDay(modalDay, { bells: updatedBells });
  };

  const renderDaysList = () => (
    <div className="space-y-3">
      {schedules.map((day, dayIdx) => {
        const isExpanded = expandedDay === day.day;
        const isToday = dayIdx === todayIdx;
        const localizedDayName = t.days[dayIdx] || day.day;

        return (
          <div
            key={day.day}
            className={`rounded-2xl border transition-all duration-200 ${
              isExpanded
                ? 'border-[#185d9e]/50 dark:border-[#185d9e] bg-white dark:bg-[#0f172a] shadow-xs ring-1 ring-[#185d9e]/20'
                : 'border-slate-200/90 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] hover:border-slate-300 dark:hover:border-[#2c3e5a]'
            }`}
          >
            {/* Day header */}
            <div className="flex items-center gap-3 p-4">
              <Toggle
                checked={day.enabled}
                onChange={(val) => updateDay(day.day, { enabled: val })}
              />

              <button
                onClick={() => toggleDay(day.day)}
                className="flex-1 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-bold ${
                      day.enabled ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-400'
                    }`}
                  >
                    {localizedDayName}
                  </span>
                  {isToday && (
                    <span className="text-xs px-2 py-0.5 bg-[#185d9e] text-white rounded-md font-bold shadow-xs">
                      {t.today}
                    </span>
                  )}
                  <span className="text-xs text-slate-500 dark:text-slate-300 font-medium">
                    {day.enabled ? `${day.bells.length} ${t.bellsCount}` : t.disabled}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 dark:text-slate-300 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Expanded bells */}
            {isExpanded && day.enabled && (
              <div className="px-4 pb-4 animate-fade-in">
                {day.bells.length === 0 ? (
                  <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-300">
                    {t.noBellsForDay}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {day.bells.map((bell) => {
                      const isPlaying = playingId === bell.id;

                      return (
                        <div
                          key={bell.id}
                          className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-[#131d31] rounded-xl border border-slate-200/70 dark:border-[#1e293b]"
                        >
                          <button
                            onClick={() => onTogglePlay(bell.id, bell)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                              isPlaying
                                ? 'bg-[#185d9e] text-white shadow-sm'
                                : 'bg-white dark:bg-[#1a2844] text-slate-700 dark:text-white border border-slate-200 dark:border-[#273852] hover:bg-[#185d9e] hover:text-white hover:border-[#185d9e]'
                            }`}
                          >
                            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                          </button>

                          <button
                            onClick={() =>
                              updateBell(day.day, bell.id, {
                                type: bell.type === 'start' ? 'end' : 'start',
                              })
                            }
                            className={`w-2.5 h-7 rounded-full cursor-pointer transition-colors ${
                              bell.type === 'start' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'
                            }`}
                            title={bell.type === 'start' ? t.startLesson : t.endLesson}
                          />

                          <input
                            type="text"
                            value={bell.label}
                            onChange={(e) =>
                              updateBell(day.day, bell.id, { label: e.target.value })
                            }
                            className="flex-1 min-w-0 px-3 py-1.5 bg-white dark:bg-[#1a2844] border border-slate-300 dark:border-[#273852] rounded-lg text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#185d9e]"
                          />

                          <input
                            type="time"
                            value={bell.time}
                            onChange={(e) =>
                              updateBell(day.day, bell.id, { time: e.target.value })
                            }
                            className="px-2.5 py-1.5 bg-white dark:bg-[#1a2844] border border-slate-300 dark:border-[#273852] rounded-lg text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#185d9e]"
                          />

                          <button
                            onClick={() => deleteBell(day.day, bell.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleOpenAddModal(day.day)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-300 dark:border-[#273852] rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-200 hover:border-[#185d9e] hover:text-[#185d9e] dark:hover:border-[#185d9e] dark:hover:text-[#60a5fa] transition-all cursor-pointer bg-slate-50/50 dark:bg-[#131d31]/50"
                  >
                    <Plus className="w-4 h-4" />
                    {t.addBell}
                  </button>

                  {day.bells.length > 0 && (
                    <button
                      onClick={() => copyToWeekdays(day)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        copiedDay === day.day
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                          : 'bg-white dark:bg-[#1a2844] text-slate-700 dark:text-white border-slate-200 dark:border-[#273852] hover:border-[#185d9e] hover:text-[#185d9e]'
                      }`}
                      title="Скопировать расписание этого дня на все будние дни"
                    >
                      {copiedDay === day.day ? (
                        <>
                          <Check className="w-4 h-4" />
                          {t.copySuccess}
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          {t.copyToWeekdays}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.scheduleTitle}</h2>
          {shortenedEnabled && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {t.shortenedBadge}
            </span>
          )}
        </div>
      </div>

      {/* Маленькая плашечка-значок при активном сокращённом расписании */}
      {shortenedEnabled && (
        <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/25 border border-amber-200/90 dark:border-amber-800/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 dark:bg-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {t.shortenedActiveWarning}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {t.regularDisabledByShortened}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {onNavigateToShortened && (
              <button
                type="button"
                onClick={onNavigateToShortened}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
              >
                {t.navShortened}
              </button>
            )}
            {onDisableShortened && (
              <button
                type="button"
                onClick={onDisableShortened}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#185d9e] hover:bg-[#134b7f] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Power className="w-3.5 h-3.5" />
                {t.switchToRegularBtn}
              </button>
            )}
          </div>
        </div>
      )}

      {/* При включённом сокращённом расписании основное расписание отключено и скрыто по умолчанию */}
      {shortenedEnabled ? (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowRegularWhenShortened(!showRegularWhenShortened)}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer py-1"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showRegularWhenShortened ? 'rotate-180' : ''
              }`}
            />
            {showRegularWhenShortened ? t.hideRegularSchedule : t.editRegularAnyway}
          </button>

          {showRegularWhenShortened && (
            <div className="mt-3 opacity-90 animate-fade-in">
              {renderDaysList()}
            </div>
          )}
        </div>
      ) : (
        renderDaysList()
      )}

      {/* Modal for adding/editing a bell */}
      {modalDay && (
        <AddBellModal
          isOpen={!!modalDay}
          dayName={modalDay}
          defaultBellCount={schedules.find((s) => s.day === modalDay)?.bells.length ?? 0}
          tracks={tracks}
          defaultTrackId={defaultTrackId}
          initialBell={editingBell}
          onClose={() => {
            setModalDay(null);
            setEditingBell(null);
          }}
          onSave={handleSaveBell}
          t={t}
        />
      )}
    </div>
  );
}
