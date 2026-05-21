#!/bin/bash

# Setup script for wallet configuration
# This helps users configure WalletConnect and prepare the app for running

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         Vigil Desktop - Wallet Setup                         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "dashboard" ]; then
  echo "❌ Please run this script from the root directory (same folder as package.json)"
  exit 1
fi

cd dashboard

# Create .env.local from .env.example if it doesn't exist
if [ ! -f ".env.local" ]; then
  echo "📝 Creating .env.local from template..."
  cp .env.example .env.local
  echo "✅ Created .env.local"
  echo ""
else
  echo "📝 .env.local already exists, skipping creation"
  echo ""
fi

# Ask user about WalletConnect setup
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  Step 1: WalletConnect Setup (Recommended)                   ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "WalletConnect allows users to connect with any mobile wallet"
echo "by scanning a QR code. Setup takes ~2 minutes:"
echo ""
echo "1. Go to: https://cloud.walletconnect.com"
echo "2. Sign up (free account)"
echo "3. Create a new project"
echo "4. Copy the Project ID"
echo ""

read -p "Do you have a WalletConnect Project ID? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  read -p "Paste your Project ID: " project_id

  if [ -n "$project_id" ]; then
    # Update .env.local with the project ID
    if grep -q "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=" .env.local; then
      # Use sed to replace the value (works on both macOS and Linux)
      if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=.*|NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=$project_id|" .env.local
      else
        sed -i "s|NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=.*|NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=$project_id|" .env.local
      fi
      echo "✅ WalletConnect Project ID configured"
    fi
  fi
else
  echo "⏭️  Skipping WalletConnect setup (you can add it later in .env.local)"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  Step 2: Contract Configuration (Optional)                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "After deploying your VIGIL contracts on Base, add the addresses:"
echo ""
echo "Edit .env.local and set:"
echo "  NEXT_PUBLIC_TOKEN_ADDRESS="
echo "  NEXT_PUBLIC_STAKING_ADDRESS="
echo "  NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS="
echo ""
echo "For testnet, also set:"
echo "  NEXT_PUBLIC_TOKEN_ADDRESS_TESTNET="
echo "  NEXT_PUBLIC_STAKING_ADDRESS_TESTNET="
echo "  NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS_TESTNET="
echo ""

read -p "Do you have contract addresses to add? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Please edit .env.local manually and add your contract addresses"
  echo "File location: $(pwd)/.env.local"
  echo ""
  read -p "Press Enter to open in editor (or Ctrl+C to skip): "

  # Try to open with default editor
  if command -v nano &> /dev/null; then
    nano .env.local
  elif command -v vim &> /dev/null; then
    vim .env.local
  elif command -v code &> /dev/null; then
    code .env.local
  else
    echo "Please open and edit: $(pwd)/.env.local"
  fi
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  Setup Complete! ✅                                          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Build the app:  npm run build"
echo "2. Start Electron: cd ../electron && npm run dev"
echo ""
echo "In the app:"
echo "• Click 'Connect' to use WalletConnect (scan QR with mobile wallet)"
echo "• Or use MetaMask extension if installed (automatically loaded)"
echo ""
echo "For more help, see: WALLET_SETUP.md"
