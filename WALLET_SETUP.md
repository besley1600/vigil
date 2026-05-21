# Wallet Setup Guide

This guide covers how to set up wallet connectivity for the Vigil desktop application.

## Quick Start: WalletConnect (Recommended)

WalletConnect is the easiest way to connect your wallet. It works with any WalletConnect-compatible wallet (MetaMask Mobile, Trust Wallet, Coinbase Wallet, etc.) and doesn't require browser extensions.

### 1. Create a WalletConnect Project

1. Go to https://cloud.walletconnect.com and sign up (free)
2. Create a new project
3. Copy your **Project ID** from the dashboard

### 2. Configure the App

```bash
cd dashboard
cp .env.example .env.local
```

Edit `.env.local` and add:
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 3. Run the App

```bash
npm run build
cd ../electron
npm run dev
```

### 4. Connect Your Wallet

- Click the "Connect" button in the top right
- A QR code will appear
- Scan it with your mobile wallet (MetaMask, Trust Wallet, etc.)
- Approve the connection in your wallet

**Done!** Your wallet is now connected to the app.

---

## Advanced: Browser Extension Support

For users who prefer to use browser extensions like MetaMask (desktop), you can optionally add extension support to Electron.

### How It Works

Electron can load browser extensions if they're installed in the user's browser profile. However, this requires additional setup:

1. User must have MetaMask (or compatible extension) installed in their default browser
2. Configure Electron to use the browser profile with extensions
3. Extension will be available in the Electron app

### Implementation (For Developers)

To enable browser extension support in Electron:

```javascript
// In electron/main.js, modify BrowserWindow creation:
const mainWindow = new BrowserWindow({
  // ... other options
  webPreferences: {
    // ... existing options
    // On macOS, use the system Chrome profile
    // This requires additional configuration
  },
})

// Load Chrome extensions from browser profile
// This is platform-specific and complex - see below for details
```

### Platform-Specific Configuration

#### macOS
```javascript
// Use Chromium profile from ~/Library/Application Support/Google/Chrome
// Extensions will be loaded automatically
const chromiumPath = path.join(
  os.homedir(),
  'Library/Application Support/Google/Chrome/Default'
)
```

#### Windows
```javascript
// Use Chromium profile from AppData
const chromiumPath = path.join(
  process.env.APPDATA,
  'Google\\Chrome\\User Data\\Default'
)
```

#### Linux
```javascript
// Use Chromium profile from ~/.config/google-chrome
const chromiumPath = path.join(
  os.homedir(),
  '.config/google-chrome/Default'
)
```

### Security Considerations

⚠️ **Important**: Loading browser extensions in Electron:
- Requires trusting the extensions (check source)
- Extensions have full access to the app's data
- Only enable if necessary
- Consider sandboxing implications

---

## Recommended Setup

### For Development
1. **Primary**: WalletConnect (works everywhere, no setup needed beyond API key)
2. **Optional**: MetaMask Extension (if you want desktop extension experience)

### For Distribution
1. Include WalletConnect Project ID in the built app
2. Document that users can also use extensions if installed
3. Provide this guide in the app repository

---

## Contract Configuration

After setting up wallet connection, you also need to configure contract addresses:

```bash
# In dashboard/.env.local, add:

# Base Mainnet (production)
NEXT_PUBLIC_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_STAKING_ADDRESS=0x...
NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS=0x...

# Base Sepolia (testnet - for testing)
NEXT_PUBLIC_TOKEN_ADDRESS_TESTNET=0x...
NEXT_PUBLIC_STAKING_ADDRESS_TESTNET=0x...
NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS_TESTNET=0x...
```

---

## Troubleshooting

### "No wallet provider found"
- Make sure you have WalletConnect configured (check `.env.local`)
- Or install a wallet extension and restart the app

### "Contracts not yet deployed on this network"
- You haven't set contract addresses in `.env.local`
- Deploy your contracts and add their addresses to the environment

### QR code not appearing
- Check that `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set correctly
- Make sure you're on the Token tab
- Try refreshing the app

### Extension not loading in Electron
- Ensure the extension is installed in your default browser
- Restart Electron after installing extension
- Check Electron DevTools for errors (F12)

---

## Next Steps

1. ✅ Set up WalletConnect (recommended first)
2. 📋 Deploy contracts on Base/Base Sepolia
3. 🔧 Add contract addresses to `.env.local`
4. 🚀 Build and distribute the app

See README.md for build instructions.
