@echo off
REM Setup script for wallet configuration (Windows)

setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║         Vigil Desktop - Wallet Setup                         ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

REM Check if we're in the right directory
if not exist "package.json" (
  echo ❌ Please run this script from the root directory
  pause
  exit /b 1
)

cd dashboard

REM Create .env.local from .env.example if it doesn't exist
if not exist ".env.local" (
  echo 📝 Creating .env.local from template...
  copy .env.example .env.local >nul
  echo ✅ Created .env.local
  echo.
) else (
  echo 📝 .env.local already exists, skipping creation
  echo.
)

REM WalletConnect setup
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║  Step 1: WalletConnect Setup (Recommended)                   ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo WalletConnect allows users to connect with any mobile wallet
echo by scanning a QR code. Setup takes ~2 minutes:
echo.
echo 1. Go to: https://cloud.walletconnect.com
echo 2. Sign up (free account)
echo 3. Create a new project
echo 4. Copy the Project ID
echo.

set /p has_wc="Do you have a WalletConnect Project ID? (y/n): "
if /i "%has_wc%"=="y" (
  set /p project_id="Paste your Project ID: "

  if not "!project_id!"=="" (
    REM Update .env.local (simple append if not exists)
    findstr /r "^NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=" .env.local >nul
    if errorlevel 1 (
      echo NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=!project_id! >> .env.local
    ) else (
      REM If line exists, you'll need to edit manually
      echo ⚠️  Found existing line - please edit .env.local manually
      echo Search for NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID and update it
    )
    echo ✅ WalletConnect Project ID configured
  )
)

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║  Step 2: Contract Configuration (Optional)                    ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo After deploying your VIGIL contracts on Base, add the addresses
echo to .env.local:
echo.
echo   NEXT_PUBLIC_TOKEN_ADDRESS=
echo   NEXT_PUBLIC_STAKING_ADDRESS=
echo   NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS=
echo.

set /p has_contracts="Do you have contract addresses to add? (y/n): "
if /i "%has_contracts%"=="y" (
  echo Please edit .env.local and add your contract addresses
  echo File location: %cd%\.env.local
  echo.
  set /p open_editor="Open in editor? (y/n): "
  if /i "!open_editor!"=="y" (
    start notepad .env.local
  )
)

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║  Setup Complete! ✅                                          ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo Next steps:
echo 1. Build the app:  npm run build
echo 2. Start Electron: cd ..\electron ^&^& npm run dev
echo.
echo In the app:
echo - Click 'Connect' to use WalletConnect (scan QR with mobile wallet)
echo - Or use MetaMask extension if installed (automatically loaded)
echo.
echo For more help, see: WALLET_SETUP.md
echo.

pause
