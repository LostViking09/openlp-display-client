import { app, BrowserWindow, ipcMain } from 'electron';

import { fileURLToPath } from 'node:url';
import path from 'node:path';

import Store from 'electron-store';
import schema from './settingsSchema.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const store = new Store({ schema });

var settingsWindow, displayWindow;

ipcMain.on("get-store", async (event, val) => {
  event.returnValue = store.get(val);
});

ipcMain.on("set-store", async (_, key, val) => {
  store.set(key, val);
});

ipcMain.on("clear-store", async () => {
  store.clear();
});

ipcMain.on("close-settings-window", async () => {
  settingsWindow.close();
});

ipcMain.on("close-display-window", async () => {
  displayWindow.close();
});

ipcMain.on("start-display-window", async () => {
  displayWindow = createDisplayWindow();
});

ipcMain.on("start-settings-window", async () => {
  settingsWindow = createSettingsWindow();
});

const createDisplayWindow = () => {
    const win = new BrowserWindow({
      backgroundThrottling: false,
      width: store.get('windowSizeWidth'),
      height: store.get('windowSizeHeight'),
      frame: (store.get('windowType') === 'Normal') ? true : false,
      fullscreen: (store.get('windowType') === 'Fullscreen') ? true : false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
    win.loadFile('src/display.html')
    return win
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
    })
    win.loadFile('src/settings.html')
    return win
}

app.whenReady().then(() => {
    if (store.get('launchToDisplay')) {
      displayWindow = createDisplayWindow()
    } else {
      settingsWindow = createSettingsWindow()
    }
  
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        if (store.get('launchToDisplay')) {
          displayWindow = createDisplayWindow()
        } else {
          settingsWindow = createSettingsWindow()
        }
      }
    })
})

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
