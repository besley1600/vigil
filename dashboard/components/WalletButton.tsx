'use client'

import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'
import { base } from 'wagmi/chains'
import { useEffect, useState } from 'react'

export function WalletButton() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { connect, isPending, error, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [hasInjected, setHasInjected] = useState(false)
  const [hasWalletConnect, setHasWalletConnect] = useState(false)

  useEffect(() => {
    const hasEthProvider = typeof window !== 'undefined' && !!window.ethereum
    setHasInjected(hasEthProvider)

    // Check if WalletConnect is configured in connectors
    const wcConnector = connectors?.find((c) => c.id === 'walletConnect')
    setHasWalletConnect(!!wcConnector)

    const msg = JSON.stringify({
      hasWindow: typeof window !== 'undefined',
      hasEthereum: !!window.ethereum,
      ethereumType: typeof window.ethereum,
      hasInjected: hasEthProvider,
      hasWalletConnect: !!wcConnector,
      availableConnectors: connectors?.map((c) => c.id) || [],
    })
    console.log('[WalletButton] Connector detection:', msg)
    ;(window as any).electron?.log?.('[WalletButton] Connector detection: ' + msg)
  }, [connectors])

  const handleConnect = () => {
    const electron = (window as any).electron
    const logs = [
      '[WalletButton] Connect button clicked',
      `[WalletButton] isPending: ${isPending}`,
      `[WalletButton] hasInjected: ${hasInjected}`,
      `[WalletButton] hasWalletConnect: ${hasWalletConnect}`,
      `[WalletButton] window.ethereum: ${typeof window.ethereum}`,
    ]
    logs.forEach((msg) => {
      console.log(msg)
      electron?.log?.(msg)
    })

    try {
      // Try injected first if available, otherwise fall back to WalletConnect
      if (hasInjected) {
        const msg = '[WalletButton] Connecting with injected provider'
        console.log(msg)
        electron?.log?.(msg)
        connect({ connector: injected() })
      } else if (hasWalletConnect) {
        const msg = '[WalletButton] Connecting with WalletConnect'
        console.log(msg)
        electron?.log?.(msg)
        const wcConnector = connectors.find((c) => c.id === 'walletConnect')
        if (wcConnector) {
          connect({ connector: wcConnector })
        }
      } else {
        const msg = '[WalletButton] No connectors available'
        console.warn(msg)
        electron?.log?.(msg)
      }
    } catch (err) {
      const msg = `[WalletButton] Connection error: ${err}`
      console.error(msg)
      electron?.log?.(msg)
    }
  }

  const canConnect = hasInjected || hasWalletConnect
  const connectLabel = hasInjected ? 'Connect' : hasWalletConnect ? 'Connect Wallet' : 'No Wallet'

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={isPending || !canConnect}
        title={
          !canConnect
            ? 'No wallet connector available'
            : hasInjected
              ? 'Connect with wallet extension'
              : 'Connect with WalletConnect (scan QR code)'
        }
        className="text-[10px] font-mono uppercase tracking-[1px] px-3 py-1.5 border border-[rgba(255,255,255,0.1)] text-primary-50 hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors disabled:opacity-50"
      >
        {isPending ? '...' : connectLabel}
      </button>
    )
  }

  const short = `${address!.slice(0, 6)}…${address!.slice(-4)}`
  const onBase = chainId === base.id

  return (
    <button
      onClick={() => disconnect()}
      title="Disconnect wallet"
      className={[
        'text-[10px] font-mono uppercase tracking-[1px] px-3 py-1.5 border transition-colors',
        onBase
          ? 'border-[rgba(255,255,255,0.1)] text-primary-50 hover:border-eva-orange hover:text-eva-orange'
          : 'border-red-500/40 text-red-400 hover:border-red-400',
      ].join(' ')}
    >
      {onBase ? short : `Wrong net · ${short}`}
    </button>
  )
}
