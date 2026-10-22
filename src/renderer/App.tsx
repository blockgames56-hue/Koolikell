import { useState, useEffect, useRef } from 'react';
import { TitleBar } from '@/components/TitleBar';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/sections/Dashboard';
import { BellSounds } from '@/sections/BellSounds';
import { Schedule } from '@/sections/Schedule';
import { Shortened } from '@/sections/Shortened';
import { SettingsSection } from '@/sections/Settings';
import { TrimAudioModal } from '@/components/TrimAudioModal';
import {
  type SectionId,
  type DaySchedule,
  type MusicTrack,
  type BellTime,
  daysOfWeek,
  defaultBells,
  defaultShortenedBells,
  defaultBuiltInTracks,
  normalizeTime,
} from '@/types';
import { translations, type Language } from '@/i18n';

function createSchedules(bells = defaultBells): DaySchedule[] {
  return daysOfWeek.map((day, idx) => ({
    day,
    dayShort: day.slice(0, 3),
    enabled: idx < 5, // Mon-Fri enabled by default, Sat-Sun disabled by default
    bells: idx === 0 ? [...bells] : bells.map((b) => ({ ...b, id: `${b.id}-${idx}` })),
  }));
}

export function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Language state
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('koolikell_lang');
    if (saved === 'en' || saved === 'et' || saved === 'ru') return saved;
    return 'ru';
  });

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('koolikell_lang', lang);
  }, [lang]);

  // Theme initialization
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('koolikell_theme');
  }, []);

  // Bell tracks state - initialized with built-in sounds so sound is ALWAYS available
  const [bellTracks, setBellTracks] = useState<MusicTrack[]>(defaultBuiltInTracks);
  const [selectedBellTrack, setSelectedBellTrack] = useState<string>('t1');
  const [bellDuration, setBellDuration] = useState(15);
  const [bellVolume, setBellVolume] = useState(80);
  const [bellRepeat, setBellRepeat] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Audio trimming state
  const [pendingTrimTrack, setPendingTrimTrack] = useState<MusicTrack | null>(null);

  // Schedules state
  const [schedules, setSchedules] = useState<DaySchedule[]>(createSchedules());
  const [shortenedSchedules, setShortenedSchedules] = useState<DaySchedule[]>(
    createSchedules(defaultShortenedBells),
  );
  const [shortenedEnabled, setShortenedEnabled] = useState(false);

  // Settings state
  const [autoStart, setAutoStart] = useState(false);
  const [systemVolume, setSystemVolume] = useState(85);
  const [weekendsOff, setWeekendsOff] = useState(true);
  const [audioOutputDeviceId, setAudioOutputDeviceId] = useState<string>('');
  const [isTestingSound, setIsTestingSound] = useState<boolean>(false);

  // Countdown state
  const [nextBellCountdown, setNextBellCountdown] = useState('--:--');
  const [nextBellInfo, setNextBellInfo] = useState<{ label: string; time: string } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopTimeoutRef = useRef<any>(null);
  const fadeIntervalRef = useRef<any>(null);

  // Audio element cache for instantaneous playback without disk I/O delay
  const audioCacheRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Scheduler state references to prevent stale closures and guarantee precision
  const schedulesRef = useRef(schedules);
  schedulesRef.current = schedules;

  const shortenedSchedulesRef = useRef(shortenedSchedules);
  shortenedSchedulesRef.current = shortenedSchedules;

  const shortenedEnabledRef = useRef(shortenedEnabled);
  shortenedEnabledRef.current = shortenedEnabled;

  const weekendsOffRef = useRef(weekendsOff);
  weekendsOffRef.current = weekendsOff;

  const bellTracksRef = useRef(bellTracks);
  bellTracksRef.current = bellTracks;

  const selectedBellTrackRef = useRef(selectedBellTrack);
  selectedBellTrackRef.current = selectedBellTrack;

  const bellDurationRef = useRef(bellDuration);
  bellDurationRef.current = bellDuration;

  const bellVolumeRef = useRef(bellVolume);
  bellVolumeRef.current = bellVolume;

  const bellRepeatRef = useRef(bellRepeat);
  bellRepeatRef.current = bellRepeat;

  const systemVolumeRef = useRef(systemVolume);
  systemVolumeRef.current = systemVolume;

  const audioOutputDeviceIdRef = useRef(audioOutputDeviceId);
  audioOutputDeviceIdRef.current = audioOutputDeviceId;

  const lastScheduleModifiedTimeRef = useRef<number>(Date.now());
  const triggeredBellsRef = useRef<Set<string>>(new Set());

  // Sound URL resolution
  const getAudioSourceUrl = (track: MusicTrack): string => {
    if (track.filePath) {
      if (
        track.filePath.startsWith('koolikell-sound://') ||
        track.filePath.startsWith('data:') ||
        track.filePath.startsWith('http')
      ) {
        return track.filePath;
      }
      return `koolikell-sound://load?path=${encodeURIComponent(track.filePath)}`;
    }
    const defaultFile = track.id === 't2' ? 'melodic_chime.wav'
      : track.id === 't3' ? 'gentle_gong.wav'
      : track.id === 't4' ? 'upbeat_marimba.wav'
      : 'classic_bell.wav';
    return `koolikell-sound://load?path=${encodeURIComponent(defaultFile)}`;
  };

  const getOrCreateAudio = (src: string): HTMLAudioElement => {
    let audio = audioCacheRef.current.get(src);
    if (!audio) {
      audio = new Audio(src);
      audio.preload = 'auto';
      audioCacheRef.current.set(src, audio);
    }
    return audio;
  };

  // Preload default tracks immediately on start so there is 0ms playback latency
  useEffect(() => {
    defaultBuiltInTracks.forEach((tr) => {
      const src = getAudioSourceUrl(tr);
      getOrCreateAudio(src);
    });
  }, []);

  // Load persistent state
  useEffect(() => {
    const saved = localStorage.getItem('koolikell_state_v5') || localStorage.getItem('koolikell_state_v4');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.bellTracks && Array.isArray(parsed.bellTracks)) {
          const userOnly = parsed.bellTracks.filter((t: MusicTrack) => !t.isDefault);
          const combined = [...defaultBuiltInTracks, ...userOnly];
          setBellTracks(combined);
          if (parsed.selectedBellTrack && combined.some((t: MusicTrack) => t.id === parsed.selectedBellTrack)) {
            setSelectedBellTrack(parsed.selectedBellTrack);
          } else {
            setSelectedBellTrack('t1');
          }
        } else {
          setBellTracks(defaultBuiltInTracks);
          setSelectedBellTrack('t1');
        }

        if (parsed.bellDuration) setBellDuration(parsed.bellDuration);
        if (parsed.bellVolume !== undefined) setBellVolume(parsed.bellVolume);
        if (parsed.bellRepeat !== undefined) setBellRepeat(parsed.bellRepeat);

        if (parsed.schedules && Array.isArray(parsed.schedules)) {
          let loaded = parsed.schedules;
          if (loaded.length < daysOfWeek.length) {
            const missing = daysOfWeek.slice(loaded.length).map((day) => ({
              day,
              dayShort: day.slice(0, 3),
              enabled: false,
              bells: [],
            }));
            loaded = [...loaded, ...missing];
          }
          setSchedules(loaded);
        }

        if (parsed.shortenedSchedules && Array.isArray(parsed.shortenedSchedules)) {
          let loaded = parsed.shortenedSchedules;
          if (loaded.length < daysOfWeek.length) {
            const missing = daysOfWeek.slice(loaded.length).map((day) => ({
              day,
              dayShort: day.slice(0, 3),
              enabled: false,
              bells: [],
            }));
            loaded = [...loaded, ...missing];
          }
          setShortenedSchedules(loaded);
        }

        if (parsed.shortenedEnabled !== undefined) setShortenedEnabled(parsed.shortenedEnabled);
        if (parsed.autoStart !== undefined) setAutoStart(parsed.autoStart);
        if (parsed.systemVolume !== undefined) setSystemVolume(parsed.systemVolume);
        if (parsed.weekendsOff !== undefined) setWeekendsOff(parsed.weekendsOff);
        if (parsed.audioOutputDeviceId !== undefined) setAudioOutputDeviceId(parsed.audioOutputDeviceId);
      } catch (e) {
        console.error('Error restoring state from localStorage:', e);
      }
    }

    if (window.koolikellApi?.getAutoStartStatus) {
      window.koolikellApi.getAutoStartStatus().then((status) => {
        setAutoStart(status);
      }).catch(() => {});
    }
  }, []);

  // Save persistent state on changes
  const saveStateToStorage = () => {
    const state = {
      bellTracks,
      selectedBellTrack,
      bellDuration,
      bellVolume,
      bellRepeat,
      schedules,
      shortenedSchedules,
      shortenedEnabled,
      autoStart,
      systemVolume,
      weekendsOff,
      audioOutputDeviceId,
    };
    localStorage.setItem('koolikell_state_v5', JSON.stringify(state));
  };

  useEffect(() => {
    saveStateToStorage();
  }, [
    bellTracks,
    selectedBellTrack,
    bellDuration,
    bellVolume,
    bellRepeat,
    schedules,
    shortenedSchedules,
    shortenedEnabled,
    autoStart,
    systemVolume,
    weekendsOff,
    audioOutputDeviceId,
  ]);

  // Handle Autostart toggle via IPC
  const handleAutoStartChange = async (val: boolean) => {
    setAutoStart(val);
    if (window.koolikellApi?.setAutoStart) {
      try {
        await window.koolikellApi.setAutoStart(val);
      } catch (err) {
        console.warn('Could not set autostart via IPC:', err);
      }
    }
  };

  const stopAllAudio = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {}
      audioRef.current = null;
    }
    setPlayingId(null);
  };

  const playTrackAudio = async (
    track: MusicTrack,
    durationSec: number,
    volPercent: number,
    loopMode: boolean = false,
    startOffsetSec: number = 0,
    customPlayingId?: string
  ) => {
    stopAllAudio();

    const effectiveVol = Math.max(0.05, Math.min(1, (volPercent / 100) * (systemVolumeRef.current / 100)));
    const primaryUrl = getAudioSourceUrl(track);
    const soundDuration = durationSec > 0 ? durationSec : 15;
    const fadeDurationSec = Math.min(3.0, Math.max(0.5, soundDuration * 0.25));

    const setupAndPlay = (src: string): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        let resolved = false;
        let audio: HTMLAudioElement;

        try {
          audio = new Audio(src);
          audio.preload = 'auto';
        } catch (e) {
          console.error('[Audio] Failed to construct Audio element:', e);
          resolve(false);
          return;
        }

        audio.volume = effectiveVol;
        audio.loop = loopMode;

        // Route output to user's selected device if setSinkId is supported
        const sinkId = audioOutputDeviceIdRef.current;
        if (sinkId && typeof (audio as any).setSinkId === 'function') {
          (audio as any).setSinkId(sinkId).catch((err: any) => {
            console.warn('[Audio] Could not set audio sink:', err);
          });
        }

        audioRef.current = audio;
        setPlayingId(customPlayingId ?? track.id);

        let playStartTime: number | null = null;
        let fadeWatcherStarted = false;

        const applySeek = () => {
          if (startOffsetSec > 0) {
            try {
              const maxSeek = audio.duration ? Math.max(0, audio.duration - 0.5) : startOffsetSec;
              audio.currentTime = Math.min(startOffsetSec, maxSeek);
            } catch (e) {
              console.warn('[Audio] Could not set currentTime:', e);
            }
          }
        };

        if (audio.readyState >= 1) {
          applySeek();
        } else {
          audio.addEventListener('loadedmetadata', applySeek, { once: true });
        }

        const startFadeWatcher = () => {
          if (fadeWatcherStarted) return;
          fadeWatcherStarted = true;
          playStartTime = performance.now();

          if (soundDuration > 0) {
            fadeIntervalRef.current = setInterval(() => {
              if (!audioRef.current || audioRef.current !== audio) {
                if (fadeIntervalRef.current) {
                  clearInterval(fadeIntervalRef.current);
                  fadeIntervalRef.current = null;
                }
                return;
              }

              if (playStartTime === null) return;
              const elapsedSec = (performance.now() - playStartTime) / 1000;
              const timeUntilCutoff = soundDuration - elapsedSec;

              if (timeUntilCutoff <= 0) {
                stopAllAudio();
              } else if (timeUntilCutoff <= fadeDurationSec) {
                // Smooth linear fade-out to 0
                const progress = Math.max(0, Math.min(1, timeUntilCutoff / fadeDurationSec));
                audio.volume = Math.max(0, Math.min(1, effectiveVol * progress));
              } else {
                audio.volume = effectiveVol;
              }
            }, 30);

            stopTimeoutRef.current = setTimeout(() => {
              stopAllAudio();
            }, (soundDuration + 0.1) * 1000);
          }
        };

        audio.addEventListener('playing', startFadeWatcher, { once: true });

        audio.onended = () => {
          if (!loopMode) {
            stopAllAudio();
          }
        };

        audio.onerror = (e) => {
          console.warn('[Audio] Playback error on url:', src, e);
          if (!resolved) {
            resolved = true;
            resolve(false);
          }
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              startFadeWatcher();
              if (!resolved) {
                resolved = true;
                resolve(true);
              }
            })
            .catch((e) => {
              console.warn('[Audio] audio.play() rejected:', e);
              if (!resolved) {
                resolved = true;
                resolve(false);
              }
            });
        }
      });
    };

    // 1. Try primary playback
    const success = await setupAndPlay(primaryUrl);

    // 2. Base64 fallback if primary failed
    if (!success && window.koolikellApi?.readAudioBase64) {
      const soundFileOrPath = track.filePath || (
        track.id === 't2' ? 'melodic_chime.wav'
        : track.id === 't3' ? 'gentle_gong.wav'
        : track.id === 't4' ? 'upbeat_marimba.wav'
        : 'classic_bell.wav'
      );
      try {
        const base64Url = await window.koolikellApi.readAudioBase64(soundFileOrPath);
        if (base64Url) {
          console.log('[Audio] Primary failed, using base64 fallback for:', soundFileOrPath);
          const fallbackSuccess = await setupAndPlay(base64Url);
          if (fallbackSuccess) return;
        }
      } catch (err) {
        console.error('[Audio] Base64 fallback failed:', err);
      }
    }

    // 3. Safety fallback to default built-in chime so a bell NEVER fails to ring silently
    if (!success && primaryUrl !== getAudioSourceUrl(defaultBuiltInTracks[0])) {
      try {
        console.log('[Audio] Falling back to default built-in track');
        await setupAndPlay(getAudioSourceUrl(defaultBuiltInTracks[0]));
      } catch (e) {
        stopAllAudio();
      }
    }
  };

  const handleTestSound = () => {
    if (isTestingSound) {
      stopAllAudio();
      setIsTestingSound(false);
      return;
    }
    setIsTestingSound(true);
    const track = bellTracks[0] || defaultBuiltInTracks[0];
    playTrackAudio(track, 3, 100, false, 0, 'test_sound');
    setTimeout(() => {
      setIsTestingSound(false);
    }, 3200);
  };

  const togglePlay = (id: string, bell?: BellTime) => {
    if (playingId === id) {
      stopAllAudio();
      return;
    }

    const track = bellTracks.find((t) => t.id === id);
    if (track) {
      const dur = track.playDurationSec ?? bellDuration;
      const offset = track.startOffsetSec ?? 0;
      playTrackAudio(track, dur, bellVolume, false, offset, id);
      return;
    }

    // Bell directly passed from schedule
    if (bell) {
      const targetTrack = (bell.trackId && bellTracks.find((t) => t.id === bell.trackId))
        || bellTracks.find((t) => t.id === selectedBellTrack)
        || bellTracks[0]
        || defaultBuiltInTracks[0];
      if (targetTrack) {
        const dur = bell.durationSec ?? targetTrack.playDurationSec ?? bellDuration;
        const offset = bell.startOffsetSec ?? targetTrack.startOffsetSec ?? 0;
        playTrackAudio(targetTrack, dur, bellVolume, false, offset, id);
      }
      return;
    }

    // Fallback: search bell across schedules
    const allBells = [...schedules, ...shortenedSchedules].flatMap((s) => s.bells);
    const foundBell = allBells.find((b) => b.id === id);
    const targetTrack = (foundBell?.trackId && bellTracks.find((t) => t.id === foundBell.trackId))
      || bellTracks.find((t) => t.id === selectedBellTrack)
      || bellTracks[0]
      || defaultBuiltInTracks[0];

    if (targetTrack) {
      const dur = foundBell?.durationSec ?? targetTrack.playDurationSec ?? bellDuration;
      const offset = foundBell?.startOffsetSec ?? targetTrack.startOffsetSec ?? 0;
      playTrackAudio(targetTrack, dur, bellVolume, false, offset, id);
    }
  };

  // Upload track handler
  const handleUploadTrack = async () => {
    if (window.koolikellApi?.uploadAudioFile) {
      try {
        const uploaded = await window.koolikellApi.uploadAudioFile();
        if (uploaded) {
          const newTrack: MusicTrack = {
            id: uploaded.id,
            name: uploaded.name,
            duration: '0:30',
            durationSec: 30,
            startOffsetSec: 0,
            playDurationSec: 15,
            selected: false,
            filePath: uploaded.filePath,
            isDefault: false,
            fileType: uploaded.fileType,
          };

          const tempAudio = new Audio(getAudioSourceUrl(newTrack));
          tempAudio.onloadedmetadata = () => {
            const sec = Math.round(tempAudio.duration);
            const m = Math.floor(sec / 60);
            const s = sec % 60;
            newTrack.duration = `${m}:${String(s).padStart(2, '0')}`;
            newTrack.durationSec = sec;
            setPendingTrimTrack(newTrack);
          };
          tempAudio.onerror = () => {
            setPendingTrimTrack(newTrack);
          };
        }
      } catch (err) {
        console.error('File upload failed:', err);
      }
    }
  };

  const handleSaveTrimmedTrack = (trimmed: MusicTrack) => {
    setBellTracks((prev) => {
      const updated = [...prev, trimmed];
      setSelectedBellTrack(trimmed.id);
      return updated;
    });
    setPendingTrimTrack(null);
  };

  const handleUpdateTrack = (updated: MusicTrack) => {
    setBellTracks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleDeleteTrack = (id: string) => {
    setBellTracks((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (selectedBellTrack === id) {
        setSelectedBellTrack(filtered[0]?.id || 't1');
      }
      return filtered;
    });
  };

  const handleUpdateSchedules = (updated: DaySchedule[]) => {
    lastScheduleModifiedTimeRef.current = Date.now();
    setSchedules(updated);
  };

  const handleUpdateShortenedSchedules = (updated: DaySchedule[]) => {
    lastScheduleModifiedTimeRef.current = Date.now();
    setShortenedSchedules(updated);
  };

  // High precision Clock & Scheduler Loop
  const checkAndTriggerBells = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = now.getSeconds();
    const currentMinutePrefix = `${hours}:${minutes}`;
    const todayDateString = now.toDateString();
    const dayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon... 6 is Sat

    // ISO day index: Monday is 0, Tuesday is 1... Sunday is 6
    const isoDayIdx = (dayOfWeek + 6) % 7;
    const activeSchedules = shortenedEnabledRef.current
      ? shortenedSchedulesRef.current
      : schedulesRef.current;
    const todaySchedule = activeSchedules[isoDayIdx] || activeSchedules[0];

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Check enabled status: if disabled or weekend without enabled flag
    if (!todaySchedule || !todaySchedule.enabled) {
      setNextBellCountdown(isWeekend ? t.weekend : t.disabled);
      setNextBellInfo(null);
      return;
    }

    const currentTotalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + seconds;

    // Find upcoming bell today
    let nextBell: { bell: BellTime; diffSec: number } | null = null;
    let minDiff = Infinity;

    for (const bell of todaySchedule.bells) {
      const normTime = normalizeTime(bell.time);
      const [bh, bm] = normTime.split(':').map(Number);
      if (isNaN(bh) || isNaN(bm)) continue;
      const bellTotalSec = bh * 3600 + bm * 60;

      if (bellTotalSec > currentTotalSeconds) {
        const diff = bellTotalSec - currentTotalSeconds;
        if (diff < minDiff) {
          minDiff = diff;
          nextBell = { bell, diffSec: diff };
        }
      }
    }

    if (nextBell) {
      setNextBellInfo({ label: nextBell.bell.label, time: nextBell.bell.time });
      const mLeft = Math.floor(nextBell.diffSec / 60);
      const sLeft = nextBell.diffSec % 60;
      setNextBellCountdown(t.inMinutesSeconds(mLeft, sLeft));
    } else {
      setNextBellCountdown(t.lessonsFinished);
      setNextBellInfo(null);
    }

    // Exact Trigger: Match bells scheduled for the current minute prefix
    for (const bell of todaySchedule.bells) {
      const normTime = normalizeTime(bell.time);
      if (normTime === currentMinutePrefix) {
        const triggerKey = `${bell.id}_${todayDateString}_${currentMinutePrefix}`;
        if (!triggeredBellsRef.current.has(triggerKey)) {
          // Bell hasn't rung yet during this minute - trigger it now!
          triggeredBellsRef.current.add(triggerKey);

          // Clean up old trigger keys to keep memory tidy
          if (triggeredBellsRef.current.size > 200) {
            for (const key of triggeredBellsRef.current) {
              if (!key.includes(todayDateString)) {
                triggeredBellsRef.current.delete(key);
              }
            }
          }

          const targetTrack =
            (bell.trackId && bellTracksRef.current.find((tr) => tr.id === bell.trackId)) ||
            bellTracksRef.current.find((tr) => tr.id === selectedBellTrackRef.current) ||
            bellTracksRef.current[0] ||
            defaultBuiltInTracks[0];

          if (targetTrack) {
            const dur = Math.max(1, bell.durationSec ?? targetTrack.playDurationSec ?? bellDurationRef.current ?? 15);
            const offset = bell.startOffsetSec ?? targetTrack.startOffsetSec ?? 0;
            console.log(`[Scheduler] 🔔 Triggering bell "${bell.label}" scheduled for ${bell.time} with track "${targetTrack.name}" (${dur}s)`);
            playTrackAudio(
              targetTrack,
              dur,
              Math.max(1, bellVolumeRef.current || 80),
              false,
              offset,
              bell.id
            );
          }
        }
      }
    }
  };

  useEffect(() => {
    const tick = () => {
      checkAndTriggerBells();
    };

    // Fast 100ms clock interval for instant millisecond-level precision without drift
    const interval = setInterval(tick, 100);

    // Also connect to Electron main process heartbeat pulse to prevent throttling in background
    const unsubscribeHeartbeat = window.koolikellApi?.onHeartbeat
      ? window.koolikellApi.onHeartbeat(() => {
          tick();
        })
      : undefined;

    return () => {
      clearInterval(interval);
      if (unsubscribeHeartbeat) unsubscribeHeartbeat();
    };
  }, [t]);

  // Localized track names for display
  const localizedTracks = bellTracks.map((tr) => {
    if (tr.id === 't1') return { ...tr, name: t.trackClassic };
    if (tr.id === 't2') return { ...tr, name: t.trackWestminster };
    if (tr.id === 't3') return { ...tr, name: t.trackGong };
    if (tr.id === 't4') return { ...tr, name: t.trackMarimba };
    return tr;
  });

  const selectedBellName =
    localizedTracks.find((t) => t.id === selectedBellTrack)?.name ?? localizedTracks[0]?.name ?? t.noMelodySelected;

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden">
      {/* Frameless Custom Titlebar */}
      <TitleBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          active={activeSection}
          onChange={setActiveSection}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          t={t}
          shortenedActive={shortenedEnabled}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-14 bg-white dark:bg-[#0c1424] border-b border-slate-200/90 dark:border-[#1e293b] flex items-center justify-between px-6 shrink-0">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">
              {activeSection === 'dashboard' && t.navDashboard}
              {activeSection === 'bell-sounds' && t.navBells}
              {activeSection === 'schedule' && t.navSchedule}
              {activeSection === 'shortened' && t.navShortened}
              {activeSection === 'settings' && t.navSettings}
            </h2>

            <div className="flex items-center gap-2">
              {/* Quick Language Switcher */}
              <div className="flex items-center bg-slate-100 dark:bg-[#131d31] border border-slate-200/60 dark:border-[#1e293b] rounded-xl p-0.5 text-xs font-semibold">
                {(['ru', 'en', 'et'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2.5 py-1 rounded-lg uppercase transition-all cursor-pointer ${
                      lang === l
                        ? 'bg-white dark:bg-[#1e293b] text-[#185d9e] dark:text-[#7bb3e8] font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-5 bg-slate-50/70">
            {activeSection === 'dashboard' && (
              <Dashboard
                schedules={shortenedEnabled ? shortenedSchedules : schedules}
                bellTrackName={selectedBellName}
                bellDuration={bellDuration}
                autoStart={autoStart}
                shortenedActive={shortenedEnabled}
                nextBellCountdown={nextBellCountdown}
                nextBellInfo={nextBellInfo}
                isPlaying={playingId !== null}
                onManualBell={() => {
                  const activeTrack = bellTracks.find((t) => t.id === selectedBellTrack) || bellTracks[0] || defaultBuiltInTracks[0];
                  if (activeTrack) {
                    const dur = activeTrack.playDurationSec ?? bellDuration;
                    const offset = activeTrack.startOffsetSec ?? 0;
                    playTrackAudio(activeTrack, dur, bellVolume, false, offset);
                  }
                }}
                onStopBell={stopAllAudio}
                t={t}
              />
            )}

            {activeSection === 'bell-sounds' && (
              <BellSounds
                tracks={localizedTracks}
                selectedTrackId={selectedBellTrack}
                duration={bellDuration}
                volume={bellVolume}
                repeatMode={bellRepeat}
                onSelectTrack={setSelectedBellTrack}
                onDurationChange={setBellDuration}
                onVolumeChange={setBellVolume}
                onRepeatChange={setBellRepeat}
                onDeleteTrack={handleDeleteTrack}
                onUploadTrack={handleUploadTrack}
                onUpdateTrack={handleUpdateTrack}
                playingId={playingId}
                onTogglePlay={togglePlay}
                t={t}
              />
            )}

            {activeSection === 'schedule' && (
              <Schedule
                schedules={schedules}
                onUpdate={handleUpdateSchedules}
                playingId={playingId}
                onTogglePlay={togglePlay}
                tracks={localizedTracks}
                defaultTrackId={selectedBellTrack}
                t={t}
                shortenedEnabled={shortenedEnabled}
                onDisableShortened={() => setShortenedEnabled(false)}
                onNavigateToShortened={() => setActiveSection('shortened')}
              />
            )}

            {activeSection === 'shortened' && (
              <Shortened
                schedules={shortenedSchedules}
                enabled={shortenedEnabled}
                onEnabledChange={setShortenedEnabled}
                onUpdate={handleUpdateShortenedSchedules}
                playingId={playingId}
                onTogglePlay={togglePlay}
                tracks={localizedTracks}
                defaultTrackId={selectedBellTrack}
                t={t}
              />
            )}

            {activeSection === 'settings' && (
              <SettingsSection
                autoStart={autoStart}
                onAutoStartChange={handleAutoStartChange}
                systemVolume={systemVolume}
                onSystemVolumeChange={setSystemVolume}
                audioOutputDeviceId={audioOutputDeviceId}
                onAudioOutputDeviceIdChange={setAudioOutputDeviceId}
                onTestSound={handleTestSound}
                isTestingSound={isTestingSound}
                currentLang={lang}
                onLangChange={setLang}
                onSave={saveStateToStorage}
                t={t}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modal for trimming audio snippet when adding a song */}
      {pendingTrimTrack && (
        <TrimAudioModal
          isOpen={!!pendingTrimTrack}
          track={pendingTrimTrack}
          audioSourceUrl={getAudioSourceUrl(pendingTrimTrack)}
          audioOutputDeviceId={audioOutputDeviceId}
          onClose={() => setPendingTrimTrack(null)}
          onSave={handleSaveTrimmedTrack}
          t={t}
        />
      )}
    </div>
  );
}

export default App;
