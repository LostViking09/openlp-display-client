const { contextBridge, ipcRenderer, BrowserWindow } = require("electron");

const electronHandler = {
    store: {
        get(key) {
            return ipcRenderer.sendSync("get-store", key);
        },
        set(property, val) {
            ipcRenderer.send("set-store", property, val);
        },
        clear() {
            ipcRenderer.send("clear-store");
        }
    },
    window: {
        main: {
            start() {
                ipcRenderer.send("start-main-window");
            },
            close() {
                ipcRenderer.send("close-main-window");
            }
        },
        settings: {
            start() {
                ipcRenderer.send("start-settings-window");
            },
            close() {
                ipcRenderer.send("close-settings-window");
            }
        }
    }

};

contextBridge.exposeInMainWorld("electron", electronHandler);
