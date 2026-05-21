# Quick Start Guide

Get the Vigil Electron app running in 5 minutes.

## 1. Clone and Install

```bash
git clone <repo-url>
cd vigil
npm install

cd dashboard
npm install

cd ../electron
npm install
```

## 2. Set Up Wallet (2 minutes)

### Option A: WalletConnect (Recommended - Works Everywhere)

```bash
# macOS/Linux
bash scripts/setup-wallet.sh

# Windows
scripts/setup-wallet.bat
```

This script will:
1. Ask for your WalletConnect Project ID (get one free at https://cloud.walletconnect.com)
2. Create `.env.local` with your configuration
3. Guide you through contract setup (optional)

### Option B: Skip WalletConnect, Use Extensions

If you already have MetaMask installed in your browser:
- The app will automatically load it
- No setup needed

## 3. Build and Run

```bash
# Build dashboard
cd ../dashboard
npm run build

# Start Electron
cd ../electron
npm run dev
```

## 4. Connect Your Wallet

In the app:
- Click the **"Connect"** button in the top right
- **WalletConnect**: Scan the QR code with your mobile wallet (MetaMask Mobile, Trust Wallet, etc.)
- **Extensions**: Click and confirm in MetaMask extension

Done! 🎉

---

## What's Next?

### To Use the Token Panel
After connecting your wallet:
1. Deploy your VIGIL contracts on Base or Base Sepolia
2. Add contract addresses to `.env.local`:
   ```
   NEXT_PUBLIC_TOKEN_ADDRESS=0x...
   NEXT_PUBLIC_STAKING_ADDRESS=0x...
   NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS=0x...
   ```
3. Restart the app

### For Production Build
```bash
npm run build:mac     # macOS DMG
npm run build:win     # Windows installer
npm run build:linux   # Linux AppImage
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No wallet provider" | Run setup script to configure WalletConnect |
| QR code not appearing | Check `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in `.env.local` |
| Extension not loading | Restart app after installing extension in your browser |
| Contracts not loading | Add contract addresses to `.env.local` and rebuild |

---

## Documentation

- **Wallet Setup**: See [WALLET_SETUP.md](WALLET_SETUP.md) for detailed configuration
- **Electron App**: See [electron/README.md](electron/README.md) for build details
- **Dashboard**: See [dashboard/README.md](dashboard/README.md) (if exists) for frontend details

---

## Support

Having issues? Check:
1. [WALLET_SETUP.md](WALLET_SETUP.md) - Comprehensive wallet guide
2. GitHub Issues - Report bugs
3. DevTools - Press F12 in the app to see console logs

Happy building! 🚀
