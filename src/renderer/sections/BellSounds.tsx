import {
  Upload,
  Play,
  Pause,
  Trash2,
  Music
} from 'lucide-react';
import { type MusicTrack } from '@/types';
import { type Translations } from '@/i18n';

interface BellSoundsProps {
  tracks: MusicTrack[];
  selectedTrackId: string;
  duration?: number;
  volume: number;
  repeatMode?: boolean;
  onSelectTrack: (id: string) => void;
  onDurationChange?: (val: number) => void;
  onVolumeChange: (val: number) => void;
  onRepeatChange?: (val: boolean) => void;
  onDeleteTrack: (id: string) => void;
  onUploadTrack: () => void;
  onUpdateTrack: (track: MusicTrack) => void;
  playingId: string | null;
  onTogglePlay: (id: string) => void;
  t: Translations;
}

export function BellSounds({
  tracks,
  selectedTrackId,
  volume,
  onSelectTrack,
  onVolumeChange,
  onDeleteTrack,
  onUploadTrack,
  playingId,
  onTogglePlay,
  t,
}: BellSoundsProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t.bellsTitle}</h2>
        <button
          onClick={onUploadTrack}
          className="btn-primary text-sm cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          {t.uploadSong}
        </button>
      </div>

      {/* Volume */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
            {t.volume}
          </label>
          <span className="text-sm font-bold text-[#185d9e]">
            {volume}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-full accent-[#185d9e] cursor-pointer"
        />
      </div>

      {/* Songs Library */}
      <div className="card p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">
          {t.melodyLibrary}
        </h3>

        {tracks.length === 0 ? (
          <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#185d9e]/15 flex items-center justify-center text-[#185d9e] mb-3">
              <Music className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 max-w-sm mx-auto">
              {t.noMelodiesMsg}
            </p>
            <button
              onClick={onUploadTrack}
              className="mt-4 btn-primary text-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              {t.uploadSong}
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tracks.map((track) => {
              const isSelected = track.id === selectedTrackId;
              const isPlaying = playingId === track.id;

              return (
                <div
                  key={track.id}
                  className={`rounded-xl border transition-all duration-200 p-3.5 ${
                    isSelected
                      ? 'border-[#185d9e] bg-[#edf5fc] shadow-xs ring-1 ring-[#185d9e]'
                      : 'border-slate-200/90 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onTogglePlay(track.id)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-[#185d9e] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-800 truncate">
                        {track.name}
                      </div>
                      <div className="text-xs font-medium text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{track.duration}</span>
                        {track.startOffsetSec !== undefined && (
                          <span className="text-[#185d9e] font-semibold bg-[#185d9e]/10 px-2 py-0.5 rounded">
                            {t.snippetInfo(track.startOffsetSec, track.startOffsetSec + (track.playDurationSec ?? 15))}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectTrack(track.id)}
                      className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#185d9e] text-white border-[#185d9e] shadow-xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-[#185d9e] hover:text-white hover:border-[#185d9e]'
                      }`}
                    >
                      {isSelected ? t.selectedBtn : t.selectBtn}
                    </button>

                    <button
                      onClick={() => onDeleteTrack(track.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
