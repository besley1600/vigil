# Vigil Desktop

An Electron wrapper for the Vigil dashboard that runs as a menu-bar app.

## Prerequisites

- **Node.js 18+**
- **The dashboard built:** from `../dashboard`, run `npm run build`
- **GitHub CLI** (`gh`) installed and authenticated — the app will guide you through this on first launch
- **Wallet configuration** (see [Wallet Setup](../WALLET_SETUP.md) for WalletConnect or browser extensions)

## Quick Start

```bash
# 1. Set up wallet (creates .env.local with WalletConnect config)
bash scripts/setup-wallet.sh    # macOS/Linux
scripts/setup-wallet.bat        # Windows

# 2. Build dashboard
cd dashboard
npm run build

# 3. Run Electron
cd ../electron
npm run dev
```

Then:
- Click "Connect" in the app to use WalletConnect (scan QR code with mobile wallet)
- Or use MetaMask extension if installed in your browser

## Development

For iterative development without rebuilding:

```bash
cd electron
npm install

# In a separate terminal, start the dashboard in dev mode:
cd ../dashboard
npm run dev -- --port 5555

# Then run Electron pointing at the already-running dev server:
cd ../electron
npm run dev
```

> In dev mode the app still tries to spawn `npm run start` in `../dashboard`.
> To use `npm run dev` instead, edit the `npmCmd` / args in `startNextServer()` in `main.js`.

## Production build

The production build bundles the compiled dashboard (`../dashboard/.next`) into the app package via `extraResources`.

```bash
# 1. Build the dashboard first
cd ../dashboard
npm run build

# 2. Build the Electron app
cd ../electron
npm install
npm run build          # builds for current platform
npm run build:mac      # macOS DMG (arm64 + x64)
npm run build:win      # Windows NSIS installer
npm run build:linux    # Linux AppImage
```

Built artifacts land in `electron/dist/`.

## Auto-updater

The auto-updater is wired to GitHub Releases via `electron-updater`. To activate it:

1. Set `publish.owner` and `publish.repo` in `package.json` to your GitHub org/repo.
2. Create a GitHub Release tagged `v1.0.0` (matching `package.json` `version`).
3. Upload the built artifacts to the release.
4. On next launch the app will detect and download updates automatically.

Builds are signed when `CSC_LINK` / `CSC_KEY_PASSWORD` (macOS) or `WIN_CSC_LINK` (Windows) environment variables are set. Unsigned builds still work for local testing.

## Tray icon

Place a `16×16` (or `32×32` for retina) PNG at `electron/assets/tray-icon.png` for a proper icon. If the file is absent the app falls back to a small orange pixel.

For macOS, a template image (black & white PNG with `@2x` suffix) is recommended so the tray icon adapts to light/dark menu bars.

## File structure

```
electron/
  main.js          — Main process: window, tray, Next.js lifecycle
  preload.js       — Context bridge (versions, gh recheck, open external)
  loading.html     — Splash screen shown while Next.js starts
  setup-check.html — Onboarding shown if gh CLI is missing / not authed
  assets/
    tray-icon.png  — (add your own)
    icon.icns      — (add your own — macOS)
    icon.ico       — (add your own — Windows)
    icon.png       — (add your own — Linux)
  package.json
  README.md
```
