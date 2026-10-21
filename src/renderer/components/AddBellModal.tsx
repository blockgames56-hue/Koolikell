import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { type BellTime, type MusicTrack } from '@/types';
import { type Translations } from '@/i18n';

interface AddBellModalProps {
  isOpen: boolean;
  dayName: string;
  defaultBellCount: number;
  tracks: MusicTrack[];
  defaultTrackId: string;
  onClose: () => void;
  onSave: (bell: BellTime) => void;
  initialBell?: BellTime | null;
  t: Translations;
}

export function AddBellModal({
  isOpen,
  dayName,
  defaultBellCount,
  tracks,
  defaultTrackId,
  onClose,
  onSave,
  initialBell,
  t,
}: AddBellModalProps) {
  const isEditing = !!initialBell;
  const defaultLessonNum = defaultBellCount + 1;

  const [label, setLabel] = useState(
    initialBell?.label ?? t.lessonDefaultName(defaultLessonNum)
  );
  const [time, setTime] = useState(initialBell?.time ?? '08:30');
  const [type, setType] = useState<'start' | 'end'>(initialBell?.type ?? 'start');
  const [trackId, setTrackId] = useState<string>(initialBell?.trackId ?? defaultTrackId);

  useEffect(() => {
    if (isOpen) {
      if (initialBell) {
        setLabel(initialBell.label);
        setTime(initialBell.time);
        setType(initialBell.type);
        setTrackId(initialBell.trackId ?? defaultTrackId);
      } else {
        const nextNum = defaultBellCount + 1;
        setLabel(t.lessonDefaultName(nextNum));
        setTime('08:30');
        setType('start');
        setTrackId(defaultTrackId);
      }
    }
  }, [isOpen, initialBell, defaultBellCount, defaultTrackId, t]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result: BellTime = {
      id: initialBell?.id ?? `bell-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      label: label.trim() || t.lessonDefaultName(1),
      time,
      type,
      trackId: trackId || undefined,
    };

    onSave(result);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="card w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#1e293b]">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {isEditing ? t.editBellTitle : t.newBellTitle}
            </h3>
            <span className="text-xs text-[#185d9e] dark:text-[#7bb3e8] font-bold">
              {dayName}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1e293b] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              {t.bellNameLabel}
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t.bellNamePlaceholder}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#131d31] border border-slate-300 dark:border-[#273852] rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#185d9e] focus:bg-white dark:focus:bg-[#131d31] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                {t.bellTimeLabel}
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#131d31] border border-slate-300 dark:border-[#273852] rounded-xl text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#185d9e] focus:bg-white dark:focus:bg-[#131d31] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                {t.bellTypeLabel}
              </label>
              <div className="flex rounded-xl bg-slate-100 dark:bg-[#131d31] p-1 border border-slate-200 dark:border-[#273852]">
                <button
                  type="button"
                  onClick={() => setType('start')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    type === 'start'
                      ? 'bg-white dark:bg-[#1e293b] text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.startLesson}
                </button>
                <button
                  type="button"
                  onClick={() => setType('end')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    type === 'end'
                      ? 'bg-white dark:bg-[#1e293b] text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.endLesson}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              {t.bellMelodyLabel}
            </label>
            <select
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-[#185d9e] focus:bg-white transition-all cursor-pointer"
            >
              {tracks.length === 0 ? (
                <option value="">{t.noMelodySelected}</option>
              ) : (
                tracks.map((track) => (
                  <option key={track.id} value={track.id} className="bg-white text-slate-800">
                    {track.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#1e293b]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e293b] transition-colors cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#185d9e] hover:bg-[#154f86] text-white rounded-xl text-sm font-bold shadow-md shadow-[#185d9e]/20 transition-all cursor-pointer"
            >
              {isEditing ? t.saveBtn : t.addBell}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
