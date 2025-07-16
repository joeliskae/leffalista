const { contextBridge, ipcRenderer } = require("electron");

// Määrittele sallitut kanavat viestintään
const validSendChannels = ["data-loaded"];
const validReceiveChannels = ["fromMain"];

contextBridge.exposeInMainWorld("electronAPI", {
  sendMessage: (channel, data) => {
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  onMessage: (channel, callback) => {
    if (validReceiveChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
});
