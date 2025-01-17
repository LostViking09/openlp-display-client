import { contextBridge, ipcRenderer } from "electron";

const electronHandler = {
    store: {
        get(key) {
            return ipcRenderer.sendSync("get-store", key);
        },
        set(property, val) {
            ipcRenderer.send("set-store", property, val);
        },
    },
};

contextBridge.exposeInMainWorld("electron", electronHandler);