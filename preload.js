const { contextBridge, ipcRenderer } = require("electron");

// Määrittele sallitut kanavat viestintään
const validSendChannels = ["data-loaded"];
const validReceiveChannels = ["fromMain"];

contextBridge.exposeInMainWorld("electronAPI", {
  sendMessage: (channel, data) => ipcRenderer.send(channel, data),
  onMessage: (channel, callback) => {
    if (validReceiveChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
  storeData: (key, data) => ipcRenderer.invoke('store-data', key, data),
  getStoredData: (key) => ipcRenderer.invoke('get-stored-data', key),
});
