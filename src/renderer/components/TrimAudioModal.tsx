import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  X,
  Music,
  Check,
  Clock,
} from 'lucide-react';
import { type MusicTrack } from '@/types';
import { type Translations } from '@/i18n';

interface TrimAudioModalProps {
  isOpen: boolean;
  track: MusicTrack | null;
  onClose: () => void;
  onSave: (trimmedTrack: MusicTrack) => void;
  t: Translations;
  audioSourceUrl: string;
  audioOutputDeviceId?: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function TrimAudioModal({
  isOpen,
  track,
  onClose,
  onSave,
  t,
  audioSourceUrl,
  audioOutputDeviceId,
}: TrimAudioModalProps) {
  const [totalDuration, setTotalDuration] = useState<number>(30);
  const [startSec, setStartSec] = useState<number>(0);
  const [endSec, setEndSec] = useState<number>(15);
  const [isPlayingSnippet, setIsPlayingSnippet] = useState<boolean>(false);
  const [currentPlayTime, setCurrentPlayTime] = useState<number>(0);
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);
  const [isDecoding, setIsDecoding] = useState<boolean>(true);

  const startSecRef = useRef<number>(startSec);
  const endSecRef = useRef<number>(endSec);
  const totalDurationRef = useRef<number>(totalDuration);

  useEffect(() => {
    startSecRef.current = startSec;
  }, [startSec]);

  useEffect(() => {
    endSecRef.current = endSec;
  }, [endSec]);

  useEffect(() => {
    totalDurationRef.current = totalDuration;
  }, [totalDuration]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const waveformContainerRef = useRef<HTMLDivElement | null>(null);

  const dragRef = useRef<{
    mode: 'start' | 'end';
    startX: number;
    initialStart: number;
    initialEnd: number;
    containerWidth: number;
    hasMoved: boolean;
  } | null>(null);

  // Initialize or decode audio whenever track changes
  useEffect(() => {
    if (!isOpen || !track) {
      stopPreview();
      return;
    }

    setIsDecoding(true);
    setWaveformPeaks([]);
    setIsPlayingSnippet(false);
    setCurrentPlayTime(0);

    const audio = new Audio(audioSourceUrl);
    if (audioOutputDeviceId && typeof (audio as any).setSinkId === 'function') {
      (audio as any).setSinkId(audioOutputDeviceId).catch(() => {});
    }
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      const dur = Math.max(2, Math.round(audio.duration || 30));
      setTotalDuration(dur);
      const initStart = Math.min(track.startOffsetSec ?? 0, Math.max(0, dur - 2));
      const initPlayDur = Math.min(track.playDurationSec ?? 15, dur - initStart);
      setStartSec(initStart);
      setEndSec(Math.min(dur, initStart + Math.max(2, initPlayDur)));
    };

    audio.onerror = () => {
      const dur = track.durationSec || 30;
      setTotalDuration(dur);
      setStartSec(0);
      setEndSec(Math.min(dur, 15));
      generateFallbackPeaks();
      setIsDecoding(false);
    };

    // Attempt to decode actual audio waveform via Web Audio API
    fetch(audioSourceUrl)
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        return audioCtx.decodeAudioData(arrayBuffer);
      })
      .then((audioBuffer) => {
        const rawData = audioBuffer.getChannelData(0);
        const samples = 120; // number of waveform bars
        const blockSize = Math.floor(rawData.length / samples);
        const peaks: number[] = [];

        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[i * blockSize + j]);
          }
          peaks.push(sum / blockSize);
        }

        const maxPeak = Math.max(...peaks) || 1;
        const normalized = peaks.map((p) => Math.max(0.12, Math.min(1, p / maxPeak)));
        setWaveformPeaks(normalized);
        setIsDecoding(false);
      })
      .catch((err) => {
        console.warn('AudioContext decode failed, using simulated waveform:', err);
        generateFallbackPeaks();
        setIsDecoding(false);
      });

    return () => {
      stopPreview();
    };
  }, [isOpen, track, audioSourceUrl]);

  const generateFallbackPeaks = () => {
    const bars = 120;
    const peaks: number[] = [];
    for (let i = 0; i < bars; i++) {
      const val = 0.2 + 0.6 * Math.sin((i / bars) * Math.PI) * (0.5 + 0.5 * Math.random());
      peaks.push(Math.max(0.15, Math.min(0.95, val)));
    }
    setWaveformPeaks(peaks);
  };

  const stopPreview = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.volume = 1;
      } catch (e) {}
    }
    setIsPlayingSnippet(false);
  };

  const toggleSnippetPlayback = () => {
    if (!audioRef.current) return;

    if (isPlayingSnippet) {
      stopPreview();
    } else {
      audioRef.current.currentTime = startSec;
      audioRef.current.volume = 1;
      audioRef.current.play().then(() => {
        setIsPlayingSnippet(true);
        trackPlayback();
      }).catch((e) => {
        console.warn('Playback error:', e);
        stopPreview();
      });
    }
  };

  const trackPlayback = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    setCurrentPlayTime(cur);

    const curEnd = endSecRef.current;
    const curStart = startSecRef.current;

    if (cur >= curEnd || audioRef.current.ended) {
      stopPreview();
      setCurrentPlayTime(curStart);
      return;
    }

    const snippetDuration = Math.max(0.1, curEnd - curStart);
    const fadeDur = Math.min(3, snippetDuration);
    if (fadeDur > 0 && cur >= curEnd - fadeDur) {
      const remaining = Math.max(0, curEnd - cur);
      const p = Math.max(0, Math.min(1, remaining / fadeDur));
      const factor = 0.5 * (1 - Math.cos(p * Math.PI));
      audioRef.current.volume = Math.max(0, Math.min(1, factor));
    } else {
      audioRef.current.volume = 1;
    }

    animFrameRef.current = requestAnimationFrame(trackPlayback);
  };

  // Start dragging one of the two handles ('start' | 'end')
  const startDrag = (mode: 'start' | 'end', e: React.PointerEvent) => {
    e.stopPropagation();
    if (!waveformContainerRef.current) return;
    const rect = waveformContainerRef.current.getBoundingClientRect();

    dragRef.current = {
      mode,
      startX: e.clientX,
      initialStart: startSec,
      initialEnd: endSec,
      containerWidth: rect.width,
      hasMoved: false,
    };

    const handlePointerMove = (moveEvt: PointerEvent) => {
      if (!dragRef.current) return;
      const { mode, startX, initialStart, initialEnd, containerWidth } = dragRef.current;
      const deltaX = moveEvt.clientX - startX;
      if (Math.abs(deltaX) > 2) {
        dragRef.current.hasMoved = true;
      }
      const dur = totalDurationRef.current;
      const deltaSec = (deltaX / containerWidth) * dur;

      if (mode === 'start') {
        const target = Math.round(initialStart + deltaSec);
        const clamped = Math.max(0, Math.min(endSecRef.current - 1, target));
        setStartSec(clamped);
      } else if (mode === 'end') {
        const target = Math.round(initialEnd + deltaSec);
        const clamped = Math.min(dur, Math.max(startSecRef.current + 1, target));
        setEndSec(clamped);
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setTimeout(() => {
        dragRef.current = null;
      }, 50);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Click on background of waveform to move nearest slider to that position
  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current?.hasMoved) return;
    if (!waveformContainerRef.current) return;
    const rect = waveformContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSecond = Math.round(ratio * totalDuration);

    const distToStart = Math.abs(targetSecond - startSec);
    const distToEnd = Math.abs(targetSecond - endSec);

    if (distToStart < distToEnd) {
      setStartSec(Math.min(targetSecond, endSec - 1));
    } else {
      setEndSec(Math.max(targetSecond, startSec + 1));
    }

    if (isPlayingSnippet && audioRef.current) {
      try {
        audioRef.current.currentTime = targetSecond;
      } catch (e) {}
    }
  };

  const handleSave = () => {
    if (!track) return;
    stopPreview();
    const finalStart = Math.min(startSec, endSec - 1);
    const finalEnd = Math.max(startSec + 1, endSec);
    const duration = finalEnd - finalStart;

    const trimmed: MusicTrack = {
      ...track,
      startOffsetSec: finalStart,
      playDurationSec: duration,
      duration: `${formatTime(finalStart)} – ${formatTime(finalEnd)}`,
    };

    onSave(trimmed);
    onClose();
  };

  if (!isOpen || !track) return null;

  const durationSec = Math.max(1, endSec - startSec);
  const startPercent = (startSec / totalDuration) * 100;
  const endPercent = (endSec / totalDuration) * 100;
  const playheadPercent = (currentPlayTime / totalDuration) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="card w-full max-w-2xl bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#185d9e]/15 flex items-center justify-center text-[#185d9e]">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t.trimModalTitle}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {track.name} ({formatTime(totalDuration)})
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopPreview();
              onClose();
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="text-xs text-slate-500 font-medium">
            {t.trimTrackSubtitle}
          </div>

          {/* Interactive Waveform Container */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#185d9e]" />
                {t.trimWaveformLabel}
              </span>
              <span className="text-[#185d9e] font-bold">
                {formatTime(startSec)} — {formatTime(endSec)} ({durationSec} {t.secondsSuffix})
              </span>
            </div>

            <div
              ref={waveformContainerRef}
              onClick={handleWaveformClick}
              className="relative h-28 bg-slate-100 dark:bg-[#0c1424] rounded-2xl overflow-hidden cursor-pointer select-none flex items-center border border-slate-200/90 dark:border-[#1e293b] shadow-inner group"
            >
              {/* Selected highlight zone (calm visual shade, no buttons) */}
              <div
                className="absolute top-0 bottom-0 bg-[#185d9e]/15 dark:bg-[#185d9e]/30 border-y border-[#185d9e]/40 pointer-events-none z-15"
                style={{
                  left: `${startPercent}%`,
                  width: `${endPercent - startPercent}%`,
                }}
              />

              {/* 1. Left Slider Handle (Начало) */}
              <div
                className="absolute top-0 bottom-0 z-30 flex flex-col items-center justify-center select-none cursor-ew-resize group/handleLeft"
                style={{
                  left: `${startPercent}%`,
                  transform: 'translateX(-50%)',
                }}
                onPointerDown={(e) => startDrag('start', e)}
                title="Ползунок начала"
              >
                {/* Vertical guide line */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-[#185d9e] dark:bg-[#4a97e2]" />

                {/* Floating start timestamp */}
                <div className="absolute top-1.5 z-20 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-[#185d9e] dark:border-[#4a97e2] text-[10px] font-mono font-bold text-[#185d9e] dark:text-[#7bb3e8] shadow-sm pointer-events-none whitespace-nowrap">
                  {formatTime(startSec)}
                </div>

                {/* Left slider thumb */}
                <div className="relative z-10 w-4 h-9 rounded-md bg-[#185d9e] text-white shadow-md flex items-center justify-center group-hover/handleLeft:scale-110 active:scale-95 transition-transform pointer-events-none">
                  <div className="w-1.5 h-3 border-r-2 border-white/90" />
                </div>
              </div>

              {/* 2. Right Slider Handle (Конец) */}
              <div
                className="absolute top-0 bottom-0 z-30 flex flex-col items-center justify-center select-none cursor-ew-resize group/handleRight"
                style={{
                  left: `${endPercent}%`,
                  transform: 'translateX(-50%)',
                }}
                onPointerDown={(e) => startDrag('end', e)}
                title="Ползунок конца"
              >
                {/* Vertical guide line */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-[#185d9e] dark:bg-[#4a97e2]" />

                {/* Floating end timestamp */}
                <div className="absolute top-1.5 z-20 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-[#185d9e] dark:border-[#4a97e2] text-[10px] font-mono font-bold text-[#185d9e] dark:text-[#7bb3e8] shadow-sm pointer-events-none whitespace-nowrap">
                  {formatTime(endSec)}
                </div>

                {/* Right slider thumb */}
                <div className="relative z-10 w-4 h-9 rounded-md bg-[#185d9e] text-white shadow-md flex items-center justify-center group-hover/handleRight:scale-110 active:scale-95 transition-transform pointer-events-none">
                  <div className="w-1.5 h-3 border-l-2 border-white/90" />
                </div>
              </div>

              {/* Moving Playhead Cursor */}
              {isPlayingSnippet && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 shadow-sm z-25 pointer-events-none transition-all"
                  style={{ left: `${playheadPercent}%` }}
                />
              )}

              {/* Waveform Bars */}
              <div className="w-full h-full px-3 flex items-center justify-between gap-[2px] relative z-10 pointer-events-none">
                {waveformPeaks.map((peak, idx) => {
                  const barPercent = (idx / waveformPeaks.length) * 100;
                  const isInsideSelection = barPercent >= startPercent && barPercent <= endPercent;

                  return (
                    <div
                      key={idx}
                      className={`flex-1 rounded-full transition-colors duration-150 ${
                        isInsideSelection
                          ? 'bg-[#185d9e] dark:bg-[#3884cb]'
                          : 'bg-slate-300 dark:bg-slate-700/60'
                      }`}
                      style={{
                        height: `${Math.max(14, peak * 82)}%`,
                      }}
                    />
                  );
                })}
              </div>

              {/* Waveform timeline timestamps */}
              <div className="absolute bottom-1 left-2 text-[9px] text-slate-400 font-mono pointer-events-none">
                0:00
              </div>
              <div className="absolute bottom-1 right-2 text-[9px] text-slate-400 font-mono pointer-events-none">
                {formatTime(totalDuration)}
              </div>
            </div>

            {/* Quick Duration Presets */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500 font-medium">
                {t.trimDurationLabel}:
              </span>
              <div className="flex items-center gap-1.5">
                {[
                  { label: t.trimPreset10s, sec: 10 },
                  { label: t.trimPreset15s, sec: 15 },
                  { label: t.trimPreset20s, sec: 20 },
                  { label: t.trimPreset30s, sec: 30 },
                  { label: t.trimPresetFull, sec: totalDuration },
                ].map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (preset.sec >= totalDuration) {
                        setStartSec(0);
                        setEndSec(totalDuration);
                      } else {
                        const newEnd = Math.min(totalDuration, startSec + preset.sec);
                        const newStart = Math.max(0, newEnd - preset.sec);
                        setStartSec(newStart);
                        setEndSec(newEnd);
                      }
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
                      durationSec === preset.sec ||
                      (preset.sec === totalDuration && startSec === 0 && endSec === totalDuration)
                        ? 'bg-[#185d9e] text-white border-[#185d9e] shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={toggleSnippetPlayback}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
              isPlayingSnippet
                ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            {isPlayingSnippet ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                {t.trimStopSnippet}
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-700 ml-0.5" />
                {t.trimPlaySnippet} ({durationSec}с)
              </>
            )}
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                stopPreview();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 bg-[#185d9e] hover:bg-[#154f86] text-white rounded-xl text-sm font-bold shadow-md shadow-[#185d9e]/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {t.trimSaveBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

