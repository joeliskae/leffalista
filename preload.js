const { contextBridge, ipcRenderer } = require('electron');

// Tarjotaan rendererille turvallinen rajapinta (API)
contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (channel, data) => {
    // Lista hyväksytyistä kanavista (turvallisuus)
    const validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  onMessage: (channel, callback) => {
    const validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  }
});
