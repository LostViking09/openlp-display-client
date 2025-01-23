import { app, BrowserWindow, ipcMain, screen, shell } from 'electron';

import { fileURLToPath } from 'node:url';
import path from 'node:path';

import Store from 'electron-store';
import schema from './settingsSchema.js';
import fontList from 'font-list';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store({ schema });

var settingsWindow, displayWindow;

ipcMain.handle('get-fonts', async () => {
  try {
    const fonts = await fontList.getFonts();
    return fonts;
  } catch (error) {
    console.error('Error getting system fonts:', error);
    return [];
  }
});

ipcMain.on('get-store', async (event, val) => {
  event.returnValue = store.get(val);
});

ipcMain.on('set-store', async (_, key, val) => {
  store.set(key, val);
});

ipcMain.on('clear-store', async () => {
  store.clear();
});

ipcMain.on('get-displays', (event) => {
  const displays = screen.getAllDisplays();
  const displayInfo = displays.map((display, index) => ({
    id: index,
    name: display.label || `Display ${index + 1}`,
    isPrimary: display.bounds.x === 0 && display.bounds.y === 0,
    bounds: display.bounds,
    size: display.size,
  }));
  event.returnValue = displayInfo;
});

ipcMain.on('close-settings-window', async () => {
  settingsWindow.close();
});

ipcMain.on('close-display-window', async () => {
  if (displayWindow) {
    const bounds = displayWindow.getBounds();
    const displays = screen.getAllDisplays();
    const selectedDisplayId = store.get('displayScreen');
    const targetDisplay = displays[selectedDisplayId] || displays[0];
    
    // Store positions relative to the target display
    store.set('lastWindowPositionX', bounds.x - targetDisplay.bounds.x);
    store.set('lastWindowPositionY', bounds.y - targetDisplay.bounds.y);
    store.set('lastWindowSizeWidth', bounds.width);
    store.set('lastWindowSizeHeight', bounds.height);
    displayWindow.close();
  }
});

ipcMain.on('start-display-window', async () => {
  displayWindow = createDisplayWindow();
});

ipcMain.on('start-settings-window', async () => {
  settingsWindow = createSettingsWindow();
});

ipcMain.on('get-display-window-bounds', (event) => {
  if (!displayWindow) {
    event.returnValue = null;
    return;
  }
  const bounds = displayWindow.getBounds();
  event.returnValue = bounds;
});

const createDisplayWindow = () => {
  // Get the selected display
  const displays = screen.getAllDisplays();
  const selectedDisplayId = store.get('displayScreen');
  const targetDisplay = displays[selectedDisplayId] || displays[0];

  const win = new BrowserWindow({
    backgroundThrottling: false,
    width: store.get('windowSizeWidth'),
    height: store.get('windowSizeHeight'),
    frame: store.get('windowType') === 'Normal',
    fullscreen: store.get('windowType') === 'Fullscreen',
    x: targetDisplay.bounds.x + store.get('windowPositionX'),
    y: targetDisplay.bounds.y + store.get('windowPositionY'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile('src/display.html');
  win.menuBarVisible = false;
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  return win;
}

const createSettingsWindow = () => {
  const win = new BrowserWindow({
    backgroundThrottling: false,
    width: 700,  // Fixed size for settings window
    height: 800,
    frame: true, // Always show frame for settings
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile('src/settings.html');
  win.menuBarVisible = false;
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  return win;
}

app.whenReady().then(() => {
  if (store.get('launchToDisplay')) {
    displayWindow = createDisplayWindow();
  } else {
    settingsWindow = createSettingsWindow();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (store.get('launchToDisplay')) {
        displayWindow = createDisplayWindow();
      } else {
        settingsWindow = createSettingsWindow();
      }
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
