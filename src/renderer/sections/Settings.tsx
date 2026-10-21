import { useState, useEffect } from 'react';
import { Volume2, RefreshCw } from 'lucide-react';
import { Toggle } from '@/components/Toggle';
import { type Language, type Translations } from '@/i18n';

interface SettingsSectionProps {
  autoStart: boolean;
  onAutoStartChange: (val: boolean) => void;
  systemVolume: number;
  onSystemVolumeChange: (val: number) => void;
  audioOutputDeviceId: string;
  onAudioOutputDeviceIdChange: (val: string) => void;
  onTestSound: () => void;
  isTestingSound?: boolean;
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  onSave: () => void;
  t: Translations;
}

export function SettingsSection({
  autoStart,
  onAutoStartChange,
  systemVolume,
  onSystemVolumeChange,
  audioOutputDeviceId,
  onAudioOutputDeviceIdChange,
  onTestSound,
  isTestingSound,
  currentLang,
  onLangChange,
  onSave,
  t,
}: SettingsSectionProps) {
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [isRefreshingDevices, setIsRefreshingDevices] = useState<boolean>(false);
  const [savedBadge, setSavedBadge] = useState<boolean>(false);

  const fetchDevices = async () => {
    try {
      setIsRefreshingDevices(true);
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const outputs = devices.filter((d) => d.kind === 'audiooutput');
        setOutputDevices(outputs);
      }
    } catch (e) {
      console.warn('Could not enumerate audio output devices:', e);
    } finally {
      setTimeout(() => setIsRefreshingDevices(false), 300);
    }
  };

  useEffect(() => {
    fetchDevices();
    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', fetchDevices);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', fetchDevices);
      };
    }
  }, []);

  const handleSaveClick = () => {
    onSave();
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
    { code: 'et', label: 'Eesti' },
  ];

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">{t.settingsTitle}</h2>
        <button
          onClick={handleSaveClick}
          className="btn-primary text-sm cursor-pointer"
        >
          {savedBadge ? t.savedNotification : t.saveSettings}
        </button>
      </div>

      {/* Language selector */}
      <div className="card p-5">
        <div className="text-sm font-bold text-slate-800 mb-1">
          {t.languageLabel}
        </div>
        <div className="text-xs text-slate-500 mb-3 font-normal">
          {t.languageDesc}
        </div>
        <div className="flex gap-2">
          {languages.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => onLangChange(item.code)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
                currentLang === item.code
                  ? 'bg-[#185d9e] text-white border-[#185d9e] shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audio Output Device */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="text-sm font-bold text-slate-800">
              {t.audioOutputDeviceLabel}
            </div>
            <div className="text-xs text-slate-500 font-normal mt-0.5">
              {t.audioOutputDeviceDesc}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchDevices}
              title="Обновить устройства"
              className="p-2 rounded-lg text-slate-500 bg-slate-50 border border-slate-200 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingDevices ? 'animate-spin text-[#185d9e]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onTestSound}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer border ${
                isTestingSound
                  ? 'bg-[#185d9e] text-white border-[#185d9e] shadow-xs animate-pulse'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-[#185d9e] hover:text-white hover:border-[#185d9e]'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              {isTestingSound ? t.testingSound : t.testSoundBtn}
            </button>
          </div>
        </div>

        <select
          value={audioOutputDeviceId}
          onChange={(e) => onAudioOutputDeviceIdChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#185d9e]/30 focus:border-[#185d9e] cursor-pointer transition-all"
        >
          <option value="">{t.defaultAudioDevice}</option>
          {outputDevices.map((device, idx) => (
            <option key={device.deviceId || idx} value={device.deviceId}>
              {device.label || `Аудиовыход ${idx + 1}`}
            </option>
          ))}
        </select>
      </div>

      {/* Auto-start with Windows */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-800">
              {t.autostartLabel}
            </div>
            <div className="text-xs text-slate-500 font-normal mt-0.5">
              {t.autostartDesc}
            </div>
          </div>
          <Toggle checked={autoStart} onChange={onAutoStartChange} />
        </div>
      </div>

      {/* Sound volume */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-bold text-slate-800">
            {t.systemVolumeLabel}
          </div>
          <span className="text-sm font-bold text-[#185d9e]">
            {systemVolume}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={systemVolume}
          onChange={(e) => onSystemVolumeChange(Number(e.target.value))}
          className="w-full accent-[#185d9e] cursor-pointer"
        />
      </div>
    </div>
  );
}
