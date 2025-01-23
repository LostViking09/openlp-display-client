const { contextBridge, ipcRenderer } = require('electron');

const electronHandler = {
  store: {
    get(key) {
      return ipcRenderer.sendSync('get-store', key);
    },
    set(property, val) {
      ipcRenderer.send('set-store', property, val);
    },
    clear() {
      ipcRenderer.send('clear-store');
    }
  },
  displays: {
    getAll() {
      return ipcRenderer.sendSync('get-displays');
    }
  },
  window: {
    display: {
      start() {
        ipcRenderer.send('start-display-window');
      },
      close() {
        ipcRenderer.send('close-display-window');
      },
      getBounds() {
        return ipcRenderer.sendSync('get-display-window-bounds');
      }
    },
    settings: {
      start() {
        ipcRenderer.send('start-settings-window');
      },
      close() {
        ipcRenderer.send('close-settings-window');
      }
    }
  },
  getFonts() {
    return ipcRenderer.invoke('get-fonts');
  }
};

contextBridge.exposeInMainWorld('electron', electronHandler);
