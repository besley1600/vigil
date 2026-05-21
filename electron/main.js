'use strict'

const { app, BrowserWindow, Tray, Menu, nativeImage, shell, ipcMain, session } = require('electron')
const { autoUpdater } = require('electron-updater')
const { spawn, execSync } = require('child_process')
const path = require('path')
const http = require('http')
const fs = require('fs')
const os = require('os')

// ── Constants ────────────────────────────────────────────────────────────────

const DASHBOARD_PORT = 5555
const DASHBOARD_URL  = `http://localhost:${DASHBOARD_PORT}`
const DASHBOARD_DIR  = path.resolve(__dirname, '..', 'dashboard')
const POLL_INTERVAL  = 500   // ms between readiness checks
const POLL_TIMEOUT   = 60000 // ms before giving up

// ── State ────────────────────────────────────────────────────────────────────

let mainWindow  = null
let tray        = null
let nextProcess = null
let isQuitting  = false

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true if `gh` is installed and authenticated.
 * Runs synchronously so we can gate the window load.
 */
function checkGhCli () {
  try {
    const whichCmd = process.platform === 'win32' ? 'where gh' : 'which gh'
    execSync(whichCmd, { stdio: 'ignore' })
    execSync('gh auth status', { stdio: 'ignore' })
    return { installed: true, authenticated: true }
  } catch {
    try {
      const whichCmd = process.platform === 'win32' ? 'where gh' : 'which gh'
      execSync(whichCmd, { stdio: 'ignore' })
      return { installed: true, authenticated: false }
    } catch {
      return { installed: false, authenticated: false }
    }
  }
}

/**
 * Poll localhost:DASHBOARD_PORT until it responds 200, then call onReady().
 * Calls onTimeout() if POLL_TIMEOUT is exceeded.
 */
function waitForDashboard (onReady, onTimeout) {
  const started = Date.now()

  function attempt () {
    http.get(DASHBOARD_URL, (res) => {
      if (res.statusCode === 200) {
        onReady()
      } else {
        scheduleRetry()
      }
      res.resume()
    }).on('error', () => {
      scheduleRetry()
    })
  }

  function scheduleRetry () {
    if (Date.now() - started > POLL_TIMEOUT) {
      onTimeout()
      return
    }
    setTimeout(attempt, POLL_INTERVAL)
  }

  attempt()
}

/**
 * Check if a port is already in use (listening).
 */
function isPortInUse (port) {
  return new Promise((resolve) => {
    const test = http.createServer()
    test.once('error', () => resolve(true))  // Port in use
    test.once('listening', () => {
      test.close()
      resolve(false)  // Port free
    })
    test.listen(port, 'localhost')
  })
}

/**
 * Spawn the Next.js production server.
 * Resolves when the process has started (not when it's ready to serve).
 * If port is already in use, skips spawning and assumes server is already running.
 */
async function startNextServer () {
  const portInUse = await isPortInUse(DASHBOARD_PORT)

  if (portInUse) {
    console.log(`[main] Port ${DASHBOARD_PORT} already in use; assuming server is running`)
    return
  }

  return new Promise((resolve, reject) => {
    const isPackaged = app.isPackaged
    const dashDir    = isPackaged
      ? path.join(process.resourcesPath, 'dashboard')
      : DASHBOARD_DIR

    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'

    nextProcess = spawn(npmCmd, ['run', 'start', '--', '--port', String(DASHBOARD_PORT)], {
      cwd:   dashDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      env:   { ...process.env, PORT: String(DASHBOARD_PORT) },
    })

    nextProcess.stdout.on('data', (data) => {
      const line = data.toString().trim()
      if (line) console.log(`[next] ${line}`)
    })

    nextProcess.stderr.on('data', (data) => {
      const line = data.toString().trim()
      if (line) console.error(`[next:err] ${line}`)
    })

    nextProcess.on('error', reject)

    // Give the process a moment to fail fast (port conflict, missing .next, etc.)
    setTimeout(resolve, 300)
  })
}

/**
 * Create a minimal 16×16 tray icon as a nativeImage.
 * Falls back to a blank image if the assets folder doesn't exist yet.
 */
function makeTrayIcon () {
  // macOS template (black & white PNG for light/dark menu bar support)
  if (process.platform === 'darwin') {
    const templatePath = path.join(__dirname, 'assets', 'tray-icon-template.png')
    if (fs.existsSync(templatePath)) {
      const img = nativeImage.createFromPath(templatePath)
      img.setTemplateImage(true)
      return img
    }
  }

  // Standard icon for other platforms
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png')
  if (fs.existsSync(iconPath)) {
    return nativeImage.createFromPath(iconPath)
  }

  // Fallback: programmatic gradient-style tray icon (purple-blue)
  const img = nativeImage.createFromBuffer(
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAgCAYAAAABLW6lAAAATUlEQVR4nGNkYGBgYGBgYGD4z8DAwMDEwMDAwMDIyMDAyMDAwCDAwMzAwMTAzMzAwCDAwPj//xcDA4NAY2Bg/PfvHwMjAyMDA9N/Bga+HwCnpJnK8wNgaAAAAABJRU5ErkJggg==',
      'base64'
    )
  )
  return img.resize({ width: 16, height: 16 })
}

// ── Window ───────────────────────────────────────────────────────────────────

function createWindow () {
  // Determine app icon for window and dock
  let appIcon = undefined
  if (process.platform !== 'darwin') {
    const iconPath = path.join(__dirname, 'assets', 'icon.png')
    if (fs.existsSync(iconPath)) {
      appIcon = iconPath
    }
  }

  mainWindow = new BrowserWindow({
    width:  1280,
    height: 800,
    frame:  true,
    backgroundColor: '#09090B',
    show: false,
    icon: appIcon,
    webPreferences: {
      nodeIntegration:  false,
      contextIsolation: true,
      sandbox:          true,
      preload:          path.join(__dirname, 'preload.js'),
      devTools: true,
    },
  })


  // Open DevTools in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools()
  }

  console.log('[main] Window created (standard OS frame)')

  // Show loading screen immediately
  mainWindow.loadFile(path.join(__dirname, 'loading.html'))
  mainWindow.once('ready-to-show', () => mainWindow.show())

  // Hide to tray on close instead of quitting
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      mainWindow.hide()
    }
  })

  // Open external links in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  return mainWindow
}

// ── Tray ─────────────────────────────────────────────────────────────────────

function createTray () {
  tray = new Tray(makeTrayIcon())
  tray.setToolTip('Vigil')

  const menu = Menu.buildFromTemplate([
    {
      label: 'Show Vigil',
      click () {
        mainWindow.show()
        mainWindow.focus()
      },
    },
    {
      label: 'Hide',
      click () { mainWindow.hide() },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click () {
        isQuitting = true
        app.quit()
      },
    },
  ])

  tray.setContextMenu(menu)

  // Left-click toggles the window
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

// ── IPC ──────────────────────────────────────────────────────────────────────

// Listen for preload logs
ipcMain.on('preload-log', (event, message) => {
  console.log(message)
})

// Listen for renderer/React logs
ipcMain.on('renderer-log', (event, message) => {
  console.log('[renderer]', message)
})

// Setup screen: re-check gh status. If all good, kick off the full boot sequence.
ipcMain.handle('gh:recheck', async () => {
  const result = checkGhCli()
  if (result.installed && result.authenticated) {
    // Transition away from the setup screen and start the server
    mainWindow.loadFile(path.join(__dirname, 'loading.html'))
    try {
      await startNextServer()
    } catch (err) {
      console.error('[main] Failed to spawn Next.js server:', err.message)
    }
    waitForDashboard(
      () => {
        console.log(`[main] Dashboard ready at ${DASHBOARD_URL}`)
        mainWindow.loadURL(DASHBOARD_URL)
      },
      () => {
        console.error('[main] Timed out waiting for dashboard')
        mainWindow.loadURL(
          `data:text/html,<body style="background:#09090B;color:#f97316;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">` +
          `<p>Could not start the dashboard. Check the console for errors.</p></body>`
        )
      }
    )
  }
  return result
})

// Setup screen: open external URLs safely
ipcMain.handle('open:external', (_, url) => {
  const allowed = ['https://cli.github.com', 'https://github.com']
  if (allowed.some(prefix => url.startsWith(prefix))) {
    shell.openExternal(url)
  }
})

// ── Auto-updater ─────────────────────────────────────────────────────────────

function initAutoUpdater () {
  if (!app.isPackaged) return // skip in dev

  autoUpdater.checkForUpdatesAndNotify()

  autoUpdater.on('update-available', () => {
    console.log('[updater] Update available — downloading…')
  })

  autoUpdater.on('update-downloaded', () => {
    console.log('[updater] Update downloaded — will install on next quit')
  })

  autoUpdater.on('error', (err) => {
    console.error('[updater]', err.message)
  })
}

// ── App lifecycle ─────────────────────────────────────────────────────────────

// Load browser extensions (e.g., MetaMask) if they exist in the user's browser profile
// This is optional and only loads extensions the user has already installed
async function loadBrowserExtensions() {
  try {
    let extensionPath = null

    if (process.platform === 'darwin') {
      // macOS
      extensionPath = path.join(
        os.homedir(),
        'Library/Application Support/Google/Chrome/Default/Extensions'
      )
    } else if (process.platform === 'win32') {
      // Windows
      extensionPath = path.join(
        process.env.APPDATA || '',
        'Google\\Chrome\\User Data\\Default\\Extensions'
      )
    } else if (process.platform === 'linux') {
      // Linux
      extensionPath = path.join(
        os.homedir(),
        '.config/google-chrome/Default/Extensions'
      )
    }

    if (extensionPath && fs.existsSync(extensionPath)) {
      // Load all extension directories
      const extensions = fs.readdirSync(extensionPath)
      for (const ext of extensions) {
        const extPath = path.join(extensionPath, ext)
        // Find the latest version directory
        if (fs.statSync(extPath).isDirectory()) {
          const versions = fs.readdirSync(extPath)
          if (versions.length > 0) {
            const latestVersion = versions.sort().pop()
            const manifestPath = path.join(extPath, latestVersion, 'manifest.json')
            if (fs.existsSync(manifestPath)) {
              try {
                await session.defaultSession.loadExtension(
                  path.join(extPath, latestVersion)
                )
                console.log(`[extensions] Loaded: ${ext}`)
              } catch (e) {
                // Extension load failed, skip it
                console.log(`[extensions] Failed to load ${ext}: ${e.message}`)
              }
            }
          }
        }
      }
    }
  } catch (e) {
    // Extension loading is optional, don't fail if it doesn't work
    console.log(`[extensions] Extension loading skipped: ${e.message}`)
  }
}

app.whenReady().then(async () => {
  // Load browser extensions if available
  if (!app.isPackaged) {
    await loadBrowserExtensions()
  }

  createWindow()
  createTray()
  initAutoUpdater()

  // Gate on gh CLI first
  const ghStatus = checkGhCli()
  if (!ghStatus.installed || !ghStatus.authenticated) {
    mainWindow.loadFile(path.join(__dirname, 'setup-check.html'))
    return
  }

  // Start Next.js server
  try {
    await startNextServer()
  } catch (err) {
    console.error('[main] Failed to spawn Next.js server:', err.message)
  }

  // Wait for it to be ready, then navigate the window
  waitForDashboard(
    () => {
      console.log(`[main] Dashboard ready at ${DASHBOARD_URL}`)
      mainWindow.loadURL(DASHBOARD_URL)
    },
    () => {
      console.error('[main] Timed out waiting for dashboard')
      mainWindow.loadURL(
        `data:text/html,<body style="background:#09090B;color:#f97316;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">` +
        `<p>Could not start the dashboard. Check the console for errors.</p></body>`
      )
    }
  )
})

app.on('window-all-closed', () => {
  // Keep app alive in tray on all platforms
  // Do not call app.quit() here
})

app.on('activate', () => {
  // macOS: re-show window when dock icon is clicked (if applicable)
  if (mainWindow && !mainWindow.isVisible()) {
    mainWindow.show()
  }
})

app.on('before-quit', () => {
  isQuitting = true
})

app.on('will-quit', () => {
  if (nextProcess && !nextProcess.killed) {
    console.log('[main] Shutting down Next.js server…')
    nextProcess.kill('SIGTERM')
  }
})
