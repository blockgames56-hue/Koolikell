export type BellCategory = 'lesson_start' | 'lesson_end' | 'warning' | 'custom';
export type DurationMode = 'full' | 'custom';

export interface BellItem {
  id: string;
  title: string;
  time: string;           // "HH:MM" or "HH:MM:SS"
  days: number[];         // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun
  soundId: string;
  durationMode: DurationMode;
  durationSeconds: number;
  enabled: boolean;
  category: BellCategory;
  order: number;
}

export interface SoundItem {
  id: string;
  name: string;
  filename: string;
  filePath: string;
  duration: number;       // in seconds
  isDefault?: boolean;
  fileType: string;
  sizeBytes?: number;
  createdAt?: string;
}

export interface AppSettings {
  autoStartWithWindows: boolean;
  schoolName: string;
  defaultBellDuration: number;
  defaultDurationMode: DurationMode;
  defaultSoundId: string;
  masterVolume: number;    // 0 - 100
  testBellDuration: number;
  playChimeBeforeBell: boolean;
  theme: 'light-blue' | 'navy-blue';
}

export interface AppData {
  bells: BellItem[];
  sounds: SoundItem[];
  settings: AppSettings;
}

export interface IpcApi {
  getData: () => Promise<AppData>;
  saveBells: (bells: BellItem[]) => Promise<boolean>;
  saveSettings: (settings: AppSettings) => Promise<boolean>;
  uploadAudioFile: () => Promise<SoundItem | null>;
  deleteAudioFile: (soundId: string) => Promise<boolean>;
  setAutoStart: (enabled: boolean) => Promise<boolean>;
  getAutoStartStatus: () => Promise<boolean>;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  exportData: () => Promise<boolean>;
  importData: () => Promise<AppData | null>;
  openAudioFolder: () => void;
  readAudioBase64?: (filePath: string) => Promise<string | null>;
  onTriggerBell: (callback: (bell: BellItem) => void) => () => void;
  onHeartbeat?: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    koolikellApi: IpcApi;
  }
}
