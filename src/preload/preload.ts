import { contextBridge, ipcRenderer } from 'electron';
import { AppData, BellItem, AppSettings, SoundItem } from '../types';

const api = {
  getData: (): Promise<AppData> => ipcRenderer.invoke('app:get-data'),
  saveBells: (bells: BellItem[]): Promise<boolean> => ipcRenderer.invoke('app:save-bells', bells),
  saveSettings: (settings: AppSettings): Promise<boolean> => ipcRenderer.invoke('app:save-settings', settings),
  uploadAudioFile: (): Promise<SoundItem | null> => ipcRenderer.invoke('app:upload-audio'),
  deleteAudioFile: (soundId: string): Promise<boolean> => ipcRenderer.invoke('app:delete-audio', soundId),
  setAutoStart: (enabled: boolean): Promise<boolean> => ipcRenderer.invoke('app:set-autostart', enabled),
  getAutoStartStatus: (): Promise<boolean> => ipcRenderer.invoke('app:get-autostart'),
  minimizeWindow: (): void => ipcRenderer.send('window:minimize'),
  maximizeWindow: (): void => ipcRenderer.send('window:maximize'),
  closeWindow: (): void => ipcRenderer.send('window:close'),
  exportData: (): Promise<boolean> => ipcRenderer.invoke('app:export-data'),
  importData: (): Promise<AppData | null> => ipcRenderer.invoke('app:import-data'),
  openAudioFolder: (): void => ipcRenderer.send('app:open-audio-folder'),
  readAudioBase64: (filePath: string): Promise<string | null> => ipcRenderer.invoke('app:read-audio-base64', filePath),
  onTriggerBell: (callback: (bell: BellItem) => void) => {
    const handler = (_event: any, bell: BellItem) => callback(bell);
    ipcRenderer.on('bell:trigger', handler);
    return () => {
      ipcRenderer.removeListener('bell:trigger', handler);
    };
  },
  onHeartbeat: (callback: (timestamp: number) => void) => {
    const handler = (_event: any, timestamp: number) => callback(timestamp);
    ipcRenderer.on('scheduler:heartbeat', handler);
    return () => {
      ipcRenderer.removeListener('scheduler:heartbeat', handler);
    };
  }
};

contextBridge.exposeInMainWorld('koolikellApi', api);
