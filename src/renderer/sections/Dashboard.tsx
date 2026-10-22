import {
  Square,
  Bell,
  AlertTriangle,
} from 'lucide-react';
import { type DaySchedule } from '@/types';
import { type Translations } from '@/i18n';

interface DashboardProps {
  schedules: DaySchedule[];
  bellTrackName: string;
  hasTracks: boolean;
  bellDuration?: number;
  autoStart: boolean;
  shortenedActive: boolean;
  nextBellCountdown: string;
  nextBellInfo: { label: string; time: string } | null;
  isPlaying: boolean;
  onManualBell?: () => void;
  onStopBell: () => void;
  onNavigateToBells?: () => void;
  t: Translations;
}

export function Dashboard({
  schedules,
  bellTrackName,
  hasTracks,
  shortenedActive,
  nextBellCountdown,
  nextBellInfo,
  isPlaying,
  onManualBell,
  onStopBell,
  onNavigateToBells,
  t,
}: DashboardProps) {
  const today = new Date();
  const dayOfWeekIndex = today.getDay(); // 0 is Sun, 1 is Mon...
  const isoIdx = (dayOfWeekIndex + 6) % 7; // Monday is 0 ... Sunday is 6
  const todayIdx = isoIdx < schedules.length ? isoIdx : 0;
  const todaySchedule = schedules[todayIdx] ?? null;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.navDashboard}</h2>

        {/* Quick action button: Stop if playing, Ring Now if idle */}
        {isPlaying ? (
          <button
            onClick={onStopBell}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-red-500/20 transition-all cursor-pointer"
          >
            <Square className="w-4 h-4 fill-white" />
            {t.stopRing}
          </button>
        ) : (
          <button
            onClick={hasTracks ? onManualBell : undefined}
            disabled={!hasTracks}
            title={!hasTracks ? t.noMusicToRing : t.ringNow}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition-all ${
              hasTracks
                ? 'bg-[#185d9e] hover:bg-[#154f86] text-white shadow-[#185d9e]/20 cursor-pointer active:scale-95'
                : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed opacity-60 shadow-none'
            }`}
          >
            <Bell className="w-4 h-4" />
            {t.ringNow}
          </button>
        )}
      </div>

      {/* Warning Banner if No Melodies Uploaded */}
      {!hasTracks && (
        <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/25 border border-amber-200/90 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-semibold">
              {t.noMusicToRing}. {t.noMelodiesDashboard}
            </span>
          </div>
          {onNavigateToBells && (
            <button
              type="button"
              onClick={onNavigateToBells}
              className="px-3.5 py-1.5 rounded-xl font-bold bg-[#185d9e] hover:bg-[#134b7f] text-white shrink-0 transition-all cursor-pointer shadow-xs self-start sm:self-center"
            >
              {t.uploadSong}
            </button>
          )}
        </div>
      )}

      {/* Sleek Status Banner */}
      <div className="card p-5 bg-gradient-to-r from-[#185d9e] to-[#124270] text-white border-0 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse-soft" />
              <span className="text-xs text-blue-100 font-medium">
                {isPlaying ? t.bellPlayingNow : t.systemRunning}
              </span>
            </div>
            <h3 className="text-lg font-bold">
              {t.todayIs}: {todayIdx !== -1 ? t.days[todayIdx] : t.weekend}
            </h3>
            <p className="text-blue-100 text-xs mt-0.5 font-medium">
              {todaySchedule?.enabled
                ? `${todaySchedule.bells.length} ${t.bellsCount}`
                : t.bellsDisabled}
            </p>
          </div>

          {nextBellInfo && (
            <div className="bg-white/20 dark:bg-black/30 backdrop-blur-md rounded-xl px-4 py-2 text-right border border-white/20">
              <div className="text-xs text-blue-100 font-medium">{t.nextBell}</div>
              <div className="text-sm font-bold text-white">
                {nextBellInfo.label} ({nextBellInfo.time})
              </div>
              <div className="text-xs text-emerald-300 font-bold">
                {nextBellCountdown}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Selected melody info */}
        <div className="card p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
            {t.mainMelody}
          </h3>
          {hasTracks ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#131d31] border border-slate-200/60 dark:border-[#1e293b]">
              <span className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                {bellTrackName || t.noMelodySelected}
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
                {t.noMelodiesDashboard}
              </span>
              {onNavigateToBells && (
                <button
                  type="button"
                  onClick={onNavigateToBells}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#185d9e] hover:bg-[#134b7f] text-white shrink-0 transition-colors shadow-xs cursor-pointer"
                >
                  {t.uploadSong}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Week Overview */}
        <div className="card p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
            {t.daysOfWeekTitle}
          </h3>
          <div className="space-y-1.5">
            {schedules.map((day, idx) => (
              <div
                key={day.day}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                  idx === todayIdx
                    ? 'bg-[#edf5fc] dark:bg-[#16294a] text-[#185d9e] dark:text-[#7bb3e8] font-semibold border border-[#b5d5f2]/60 dark:border-[#223d6b]'
                    : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    day.enabled ? 'bg-[#185d9e]' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
                <span>{t.days[idx] || day.day}</span>
                <span className="text-xs text-slate-500 dark:text-slate-300 ml-auto font-medium">
                  {day.enabled ? `${day.bells.length} ${t.bellsCount}` : t.disabled}
                </span>
                {idx === todayIdx && (
                  <span className="text-[10px] uppercase font-bold text-white bg-[#185d9e] px-2 py-0.5 rounded shadow-xs">
                    {shortenedActive ? t.shortenedBadge : t.today}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
