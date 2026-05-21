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

// Expose the ethereum provider (MetaMask, etc.) to the renderer process
// This is required for wagmi's injected() connector to work in Electron with contextIsolation

// Send logs to main process for visibility
const log = (msg) => ipcRenderer.send('preload-log', msg)

log('[preload] Initializing ethereum provider exposure')
log('[preload] window.ethereum available: ' + !!window.ethereum)

if (window.ethereum) {
  log('[preload] Exposing ethereum provider directly')
  contextBridge.exposeInMainWorld('ethereum', window.ethereum)
} else {
  log('[preload] Creating ethereum proxy for lazy-loaded provider')
  // If ethereum provider is not available yet, expose a proxy that will defer to window.ethereum
  const ethereumProxy = new Proxy({}, {
    get(target, prop) {
      if (window.ethereum && typeof window.ethereum[prop] === 'function') {
        return (...args) => window.ethereum[prop](...args)
      }
      return window.ethereum?.[prop]
    },
  })
  contextBridge.exposeInMainWorld('ethereum', ethereumProxy)
}

log('[preload] Preload script completed')
