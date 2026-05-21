'use strict'

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  versions: {
    node:     process.versions.node,
    electron: process.versions.electron,
    chrome:   process.versions.chrome,
  },

  // Ask the main process to re-check gh CLI status
  ghRecheck: () => ipcRenderer.invoke('gh:recheck'),

  // Open an external URL (validated in main.js)
  openExternal: (url) => ipcRenderer.invoke('open:external', url),

  // Log a message to the main process
  log: (message) => ipcRenderer.send('renderer-log', message),
})

