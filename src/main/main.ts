import { app, BrowserWindow, ipcMain, dialog, Menu, Tray, protocol, net, session } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { pathToFileURL } from 'url';
import { AppStore } from './store';
import { BellItem, AppSettings, SoundItem, AppData } from '../types';

// Prevent Chromium timer throttling in background, minimized, or occluded window states
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
// Allow scheduled bells to play audio automatically without requiring user gesture
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let store: AppStore;

// Register custom protocol scheme as privileged before app is ready
// This enables Range requests (required for HTML5 <audio> streaming & seeking), fetch, and CORS
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'koolikell-sound',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
      bypassCSP: true
    }
  }
]);

// Prevent multiple instances - if user clicks app again, bring it to focus immediately
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function getAppLogoPath(): string {
  const candidates = [
    path.join(__dirname, '../../assets/logo.png'),
    path.join(__dirname, '../assets/logo.png'),
    path.join(__dirname, '../../assets/icon.ico'),
    path.join(process.resourcesPath || '', 'assets/logo.png'),
    path.join(app.getAppPath(), 'assets/logo.png'),
  ];
  for (const cand of candidates) {
    if (cand && fs.existsSync(cand)) return cand;
  }
  return '';
}

function createMainWindow(): BrowserWindow {
  const logoPath = getAppLogoPath();

  const win = new BrowserWindow({
    width: 1220,
    height: 840,
    minWidth: 1000,
    minHeight: 680,
    frame: false,
    show: true,
    backgroundColor: '#f8fafc',
    icon: logoPath ? logoPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false
    }
  });

  win.loadFile(path.join(__dirname, '../renderer/index.html'));

  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('Failed to load renderer HTML:', errorCode, errorDescription);
  });

  win.webContents.on('console-message', (_event, level, message) => {
    if (level >= 2) {
      console.warn(`[Renderer] ${message}`);
    } else {
      console.log(`[Renderer] ${message}`);
    }
  });

  // Ensure window is in front and focused
  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });

  win.on('close', (event) => {
    // If not quitting, minimize to tray
    if (!(app as any).isQuitting) {
      event.preventDefault();
      win.hide();
    }
  });

  return win;
}

function setupTray(): void {
  try {
    const logoPath = getAppLogoPath();
    if (!logoPath) return;
    const { nativeImage } = require('electron');
    const iconImage = nativeImage.createFromPath(logoPath);
    if (!iconImage || iconImage.isEmpty()) return;
    tray = new Tray(iconImage.resize({ width: 16, height: 16 }));
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Открыть Koolikell',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: 'Свернуть в трей',
        click: () => {
          if (mainWindow) {
            mainWindow.hide();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Выход из программы',
        click: () => {
          (app as any).isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setToolTip('Koolikell — Школьные звонки');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
  } catch (err) {
    console.warn('Could not initialize tray icon:', err);
  }
}

// Register custom protocol for local audio streaming with Range & Seeking support
function registerAudioProtocol(): void {
  protocol.handle('koolikell-sound', async (request) => {
    try {
      const url = new URL(request.url);
      const targetPath = url.searchParams.get('path') || '';
      if (!targetPath) {
        return new Response('Missing path parameter', { status: 400 });
      }

      let resolvedPath = '';
      if (fs.existsSync(targetPath)) {
        resolvedPath = targetPath;
      } else {
        const soundFileName = path.basename(targetPath);
        const candidates = [
          path.join(process.resourcesPath || '', 'assets/sounds', soundFileName),
          path.join(process.resourcesPath || '', 'assets', soundFileName),
          path.join(app.getAppPath(), 'assets/sounds', soundFileName),
          path.join(app.getAppPath(), 'assets', soundFileName),
          path.join(__dirname, '../../assets/sounds', soundFileName),
          path.join(__dirname, '../assets/sounds', soundFileName),
          path.join(__dirname, '../../assets', soundFileName),
          path.join(store ? store.getUserSoundsDir() : '', soundFileName),
        ];

        for (const cand of candidates) {
          if (cand && fs.existsSync(cand)) {
            resolvedPath = cand;
            break;
          }
        }
      }

      if (resolvedPath && fs.existsSync(resolvedPath)) {
        const stat = fs.statSync(resolvedPath);
        const fileSize = stat.size;
        const rangeHeader = request.headers.get('range');

        const ext = path.extname(resolvedPath).toLowerCase();
        const mimeTypes: Record<string, string> = {
          '.mp3': 'audio/mpeg',
          '.wav': 'audio/wav',
          '.ogg': 'audio/ogg',
          '.m4a': 'audio/mp4',
          '.aac': 'audio/aac',
          '.flac': 'audio/flac',
        };
        const contentType = mimeTypes[ext] || 'audio/mpeg';
        const { Readable } = require('stream');

        if (rangeHeader) {
          const parts = rangeHeader.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

          if (!isNaN(start) && start < fileSize) {
            const safeEnd = Math.min(isNaN(end) ? fileSize - 1 : end, fileSize - 1);
            const chunkSize = safeEnd - start + 1;
            const nodeStream = fs.createReadStream(resolvedPath, { start, end: safeEnd });
            const webStream = Readable.toWeb(nodeStream);

            return new Response(webStream as any, {
              status: 206,
              headers: {
                'Content-Range': `bytes ${start}-${safeEnd}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': String(chunkSize),
                'Content-Type': contentType,
              }
            });
          }
        }

        const nodeStream = fs.createReadStream(resolvedPath);
        const webStream = Readable.toWeb(nodeStream);
        return new Response(webStream as any, {
          status: 200,
          headers: {
            'Content-Length': String(fileSize),
            'Accept-Ranges': 'bytes',
            'Content-Type': contentType,
          }
        });
      }

      console.warn('Audio file not found on disk:', targetPath);
      return new Response(`File not found: ${targetPath}`, { status: 404 });
    } catch (err: any) {
      console.error('Error in koolikell-sound protocol handler:', err);
      return new Response(err?.message || 'Internal audio error', { status: 500 });
    }
  });
}

function setupIpc(): void {
  ipcMain.handle('app:get-data', () => {
    return store.getData();
  });

  ipcMain.handle('app:save-bells', (_event, bells: BellItem[]) => {
    return store.saveBells(bells);
  });

  ipcMain.handle('app:save-settings', (_event, settings: AppSettings) => {
    const success = store.saveSettings(settings);
    if (success) {
      applyAutostartSetting(settings.autoStartWithWindows);
    }
    return success;
  });

  ipcMain.handle('app:upload-audio', async () => {
    if (!mainWindow) return null;

    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Выберите аудиофайл для звонка',
      filters: [
        { name: 'Аудиофайлы (*.mp3, *.wav, *.webm, *.ogg, *.m4a)', extensions: ['mp3', 'wav', 'webm', 'ogg', 'm4a', 'aac', 'flac'] }
      ],
      properties: ['openFile']
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const sourcePath = result.filePaths[0];
    const ext = path.extname(sourcePath).toLowerCase();
    const originalName = path.basename(sourcePath, ext);
    const id = 'snd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const targetFileName = `${id}${ext}`;
    const targetPath = path.join(store.getUserSoundsDir(), targetFileName);

    fs.copyFileSync(sourcePath, targetPath);

    const stats = fs.statSync(targetPath);

    const soundItem: SoundItem = {
      id,
      name: originalName,
      filename: targetFileName,
      filePath: targetPath,
      duration: 0, // Renderer will detect exact audio duration upon loading
      isDefault: false,
      fileType: ext.replace('.', ''),
      sizeBytes: stats.size,
      createdAt: new Date().toISOString()
    };

    store.addSound(soundItem);
    return soundItem;
  });

  ipcMain.handle('app:delete-audio', (_event, soundId: string) => {
    return store.deleteSound(soundId);
  });

  ipcMain.handle('app:get-autostart', () => {
    return app.getLoginItemSettings().openAtLogin;
  });

  ipcMain.handle('app:set-autostart', (_event, enabled: boolean) => {
    applyAutostartSetting(enabled);
    const settings = store.getData().settings;
    settings.autoStartWithWindows = enabled;
    store.saveSettings(settings);
    return app.getLoginItemSettings().openAtLogin;
  });

  ipcMain.on('window:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.on('window:close', () => {
    mainWindow?.hide();
  });

  ipcMain.handle('app:export-data', async () => {
    if (!mainWindow) return false;
    const saveRes = await dialog.showSaveDialog(mainWindow, {
      title: 'Экспорт расписания и настроек Koolikell',
      defaultPath: 'koolikell_backup.json',
      filters: [{ name: 'JSON файл (*.json)', extensions: ['json'] }]
    });

    if (saveRes.canceled || !saveRes.filePath) return false;

    fs.writeFileSync(saveRes.filePath, JSON.stringify(store.getData(), null, 2), 'utf-8');
    return true;
  });

  ipcMain.handle('app:import-data', async () => {
    if (!mainWindow) return null;
    const openRes = await dialog.showOpenDialog(mainWindow, {
      title: 'Импорт расписания Koolikell',
      filters: [{ name: 'JSON файл (*.json)', extensions: ['json'] }],
      properties: ['openFile']
    });

    if (openRes.canceled || openRes.filePaths.length === 0) return null;

    try {
      const content = fs.readFileSync(openRes.filePaths[0], 'utf-8');
      const data: AppData = JSON.parse(content);
      store.importData(data);
      return store.getData();
    } catch (e) {
      console.error('Import failed:', e);
      return null;
    }
  });

  // Base64 audio fallback IPC
  ipcMain.handle('app:read-audio-base64', async (_event, filePath: string) => {
    try {
      if (!filePath) return null;
      let resolved = filePath;
      if (!fs.existsSync(resolved)) {
        const soundFileName = path.basename(filePath);
        const candidates = [
          path.join(__dirname, '../../assets/sounds', soundFileName),
          path.join(__dirname, '../assets/sounds', soundFileName),
          path.join(__dirname, '../../assets', soundFileName),
          path.join(process.resourcesPath || '', 'assets/sounds', soundFileName),
          path.join(process.resourcesPath || '', 'assets', soundFileName),
          path.join(app.getAppPath(), 'assets/sounds', soundFileName),
          path.join(app.getAppPath(), 'assets', soundFileName),
          path.join(store ? store.getUserSoundsDir() : '', soundFileName),
        ];
        for (const cand of candidates) {
          if (cand && fs.existsSync(cand)) {
            resolved = cand;
            break;
          }
        }
      }

      if (fs.existsSync(resolved)) {
        const ext = path.extname(resolved).toLowerCase();
        let mime = 'audio/mpeg';
        if (ext === '.wav') mime = 'audio/wav';
        else if (ext === '.ogg') mime = 'audio/ogg';
        else if (ext === '.m4a' || ext === '.aac') mime = 'audio/mp4';
        else if (ext === '.webm') mime = 'audio/webm';
        else if (ext === '.flac') mime = 'audio/flac';

        const buffer = fs.readFileSync(resolved);
        return `data:${mime};base64,${buffer.toString('base64')}`;
      }
      return null;
    } catch (err) {
      console.error('Failed to read audio base64:', err);
      return null;
    }
  });

  ipcMain.on('app:open-audio-folder', () => {
    const { shell } = require('electron');
    shell.openPath(store.getUserSoundsDir());
  });
}

function applyAutostartSetting(enabled: boolean): void {
  try {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      path: process.execPath,
      args: ['--autostart']
    });
  } catch (err) {
    console.error('Failed to configure login item setting:', err);
  }
}

app.whenReady().then(() => {
  store = new AppStore();
  registerAudioProtocol();
  setupIpc();
  setupTray();

  // Allow audio device enumeration without blocking prompts
  try {
    session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
      callback(true);
    });
    session.defaultSession.setPermissionCheckHandler(() => true);
  } catch (e) {
    console.warn('Could not set session permission handlers:', e);
  }

  // Create and show main window immediately
  mainWindow = createMainWindow();

  // Unthrottled Node.js heartbeat pulse to guarantee zero-delay bell triggering even when minimized to tray
  setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('scheduler:heartbeat', Date.now());
    }
  }, 500);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow();
    } else if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

app.on('before-quit', () => {
  (app as any).isQuitting = true;
});

app.on('window-all-closed', () => {
  // On Windows, keep app in tray unless user explicitly exits
  if (process.platform !== 'darwin') {
    if ((app as any).isQuitting) {
      app.quit();
    }
  }
});
