import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { AppData, BellItem, SoundItem, AppSettings } from '../types';

export class AppStore {
  private dataFilePath: string;
  private userSoundsDir: string;
  private appData: AppData;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.dataFilePath = path.join(userDataPath, 'koolikell_config.json');
    this.userSoundsDir = path.join(userDataPath, 'custom_audio');

    if (!fs.existsSync(this.userSoundsDir)) {
      fs.mkdirSync(this.userSoundsDir, { recursive: true });
    }

    this.appData = this.loadData();
  }

  public getUserSoundsDir(): string {
    return this.userSoundsDir;
  }

  public getData(): AppData {
    return this.appData;
  }

  public saveBells(bells: BellItem[]): boolean {
    try {
      this.appData.bells = bells;
      this.persist();
      return true;
    } catch (err) {
      console.error('Failed to save bells:', err);
      return false;
    }
  }

  public saveSettings(settings: AppSettings): boolean {
    try {
      this.appData.settings = settings;
      this.persist();
      return true;
    } catch (err) {
      console.error('Failed to save settings:', err);
      return false;
    }
  }

  public addSound(sound: SoundItem): boolean {
    try {
      this.appData.sounds.push(sound);
      this.persist();
      return true;
    } catch (err) {
      console.error('Failed to add sound:', err);
      return false;
    }
  }

  public deleteSound(soundId: string): boolean {
    try {
      const idx = this.appData.sounds.findIndex(s => s.id === soundId);
      if (idx !== -1) {
        const sound = this.appData.sounds[idx];
        if (!sound.isDefault && fs.existsSync(sound.filePath)) {
          try {
            fs.unlinkSync(sound.filePath);
          } catch (e) {
            console.warn('Could not remove file from disk:', e);
          }
        }
        this.appData.sounds.splice(idx, 1);
        this.persist();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete sound:', err);
      return false;
    }
  }

  public importData(imported: AppData): boolean {
    try {
      if (Array.isArray(imported.bells)) this.appData.bells = imported.bells;
      if (imported.settings) this.appData.settings = imported.settings;
      this.persist();
      return true;
    } catch (err) {
      console.error('Failed to import data:', err);
      return false;
    }
  }

  private persist(): void {
    fs.writeFileSync(this.dataFilePath, JSON.stringify(this.appData, null, 2), 'utf-8');
  }

  private loadData(): AppData {
    const defaultSounds: SoundItem[] = [];

    const defaultBells: BellItem[] = [
      {
        id: 'bell-1',
        title: '1 Урок — Начало',
        time: '08:30',
        days: [1, 2, 3, 4, 5],
        soundId: 'melodic_chime',
        durationMode: 'custom',
        durationSeconds: 10,
        enabled: true,
        category: 'lesson_start',
        order: 1
      },
      {
        id: 'bell-2',
        title: '1 Урок — Конец',
        time: '09:15',
        days: [1, 2, 3, 4, 5],
        soundId: 'classic_bell',
        durationMode: 'custom',
        durationSeconds: 6,
        enabled: true,
        category: 'lesson_end',
        order: 2
      },
      {
        id: 'bell-3',
        title: '2 Урок — Начало',
        time: '09:25',
        days: [1, 2, 3, 4, 5],
        soundId: 'melodic_chime',
        durationMode: 'custom',
        durationSeconds: 10,
        enabled: true,
        category: 'lesson_start',
        order: 3
      },
      {
        id: 'bell-4',
        title: '2 Урок — Конец',
        time: '10:10',
        days: [1, 2, 3, 4, 5],
        soundId: 'classic_bell',
        durationMode: 'custom',
        durationSeconds: 6,
        enabled: true,
        category: 'lesson_end',
        order: 4
      },
      {
        id: 'bell-5',
        title: '3 Урок — Начало',
        time: '10:25',
        days: [1, 2, 3, 4, 5],
        soundId: 'melodic_chime',
        durationMode: 'custom',
        durationSeconds: 10,
        enabled: true,
        category: 'lesson_start',
        order: 5
      },
      {
        id: 'bell-6',
        title: '3 Урок — Конец (Обед)',
        time: '11:10',
        days: [1, 2, 3, 4, 5],
        soundId: 'classic_bell',
        durationMode: 'custom',
        durationSeconds: 6,
        enabled: true,
        category: 'lesson_end',
        order: 6
      },
      {
        id: 'bell-7',
        title: '4 Урок — Начало',
        time: '11:30',
        days: [1, 2, 3, 4, 5],
        soundId: 'melodic_chime',
        durationMode: 'custom',
        durationSeconds: 10,
        enabled: true,
        category: 'lesson_start',
        order: 7
      },
      {
        id: 'bell-8',
        title: '4 Урок — Конец',
        time: '12:15',
        days: [1, 2, 3, 4, 5],
        soundId: 'classic_bell',
        durationMode: 'custom',
        durationSeconds: 6,
        enabled: true,
        category: 'lesson_end',
        order: 8
      },
      {
        id: 'bell-9',
        title: '5 Урок — Начало',
        time: '12:30',
        days: [1, 2, 3, 4, 5],
        soundId: 'melodic_chime',
        durationMode: 'custom',
        durationSeconds: 10,
        enabled: true,
        category: 'lesson_start',
        order: 9
      },
      {
        id: 'bell-10',
        title: '5 Урок — Конец',
        time: '13:15',
        days: [1, 2, 3, 4, 5],
        soundId: 'classic_bell',
        durationMode: 'custom',
        durationSeconds: 6,
        enabled: true,
        category: 'lesson_end',
        order: 10
      },
      {
        id: 'bell-11',
        title: '6 Урок — Начало',
        time: '13:25',
        days: [1, 2, 3, 4, 5],
        soundId: 'melodic_chime',
        durationMode: 'custom',
        durationSeconds: 10,
        enabled: true,
        category: 'lesson_start',
        order: 11
      },
      {
        id: 'bell-12',
        title: '6 Урок — Конец',
        time: '14:10',
        days: [1, 2, 3, 4, 5],
        soundId: 'classic_bell',
        durationMode: 'custom',
        durationSeconds: 6,
        enabled: true,
        category: 'lesson_end',
        order: 12
      }
    ];

    const defaultSettings: AppSettings = {
      autoStartWithWindows: false,
      schoolName: 'Koolikell — Школа',
      defaultBellDuration: 10,
      defaultDurationMode: 'custom',
      defaultSoundId: '',
      masterVolume: 100,
      testBellDuration: 5,
      playChimeBeforeBell: false,
      theme: 'light-blue'
    };

    if (fs.existsSync(this.dataFilePath)) {
      try {
        const content = fs.readFileSync(this.dataFilePath, 'utf-8');
        const parsed = JSON.parse(content);
        const legacyDefaultIds = ['classic_bell', 'melodic_chime', 'gentle_gong', 'upbeat_marimba', 't1', 't2', 't3', 't4'];
        const validCustomSounds = (parsed.sounds || []).filter(
          (s: SoundItem) =>
            !s.isDefault &&
            !legacyDefaultIds.includes(s.id) &&
            fs.existsSync(s.filePath)
        );

        return {
          bells: parsed.bells || defaultBells,
          sounds: validCustomSounds,
          settings: { ...defaultSettings, ...(parsed.settings || {}) }
        };
      } catch (e) {
        console.error('Error reading config file, using defaults:', e);
      }
    }

    return {
      bells: defaultBells,
      sounds: [],
      settings: defaultSettings
    };
  }

  private mergeSounds(_defaultSounds: SoundItem[], customSounds: SoundItem[]): SoundItem[] {
    const legacyDefaultIds = ['classic_bell', 'melodic_chime', 'gentle_gong', 'upbeat_marimba', 't1', 't2', 't3', 't4'];
    return (customSounds || []).filter((s) => !s.isDefault && !legacyDefaultIds.includes(s.id));
  }
}
