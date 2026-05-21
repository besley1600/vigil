import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? ''

// Log warning if WalletConnect is not configured in development
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development' && !WC_PROJECT_ID) {
  console.warn('[web3] WalletConnect not configured. To enable WalletConnect:')
  console.warn('1. Go to https://cloud.walletconnect.com and create a project (free)')
  console.warn('2. Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local')
  console.warn('3. Restart the app')
}

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    ...(WC_PROJECT_ID ? [walletConnect({ projectId: WC_PROJECT_ID })] : []),
  ],
  transports: {
    [base.id]:        http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
  },
  ssr: true,
})

type Addr = `0x${string}`

function addr(v: string | undefined): Addr | undefined {
  return v ? (v as Addr) : undefined
}

export const CONTRACTS: Record<number, { token?: Addr; staking?: Addr; feeCollector?: Addr }> = {
  [base.id]: {
    token:        addr(process.env.NEXT_PUBLIC_TOKEN_ADDRESS),
    staking:      addr(process.env.NEXT_PUBLIC_STAKING_ADDRESS),
    feeCollector: addr(process.env.NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS),
  },
  [baseSepolia.id]: {
    token:        addr(process.env.NEXT_PUBLIC_TOKEN_ADDRESS_TESTNET),
    staking:      addr(process.env.NEXT_PUBLIC_STAKING_ADDRESS_TESTNET),
    feeCollector: addr(process.env.NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS_TESTNET),
  },
}

export const TOKEN_ABI = [
  { name: 'balanceOf',  type: 'function', stateMutability: 'view',        inputs: [{ name: 'account', type: 'address' }],                                              outputs: [{ name: '', type: 'uint256' }] },
  { name: 'totalSupply',type: 'function', stateMutability: 'view',        inputs: [],                                                                                   outputs: [{ name: '', type: 'uint256' }] },
  { name: 'approve',    type: 'function', stateMutability: 'nonpayable',  inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],          outputs: [{ name: '', type: 'bool' }] },
  { name: 'allowance',  type: 'function', stateMutability: 'view',        inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],           outputs: [{ name: '', type: 'uint256' }] },
] as const

export const STAKING_ABI = [
  { name: 'stake',            type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }],  outputs: [] },
  { name: 'unstake',          type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }],  outputs: [] },
  { name: 'claimRewards',     type: 'function', stateMutability: 'nonpayable', inputs: [],                                     outputs: [] },
  { name: 'userInfo',         type: 'function', stateMutability: 'view',       inputs: [{ name: '', type: 'address' }],        outputs: [{ name: 'staked', type: 'uint256' }, { name: 'rewardDebt', type: 'uint256' }, { name: 'pendingRewards', type: 'uint256' }] },
  { name: 'getDiscountBps',   type: 'function', stateMutability: 'view',       inputs: [{ name: 'user', type: 'address' }],   outputs: [{ name: '', type: 'uint256' }] },
  { name: 'pendingRewardsFor',type: 'function', stateMutability: 'view',       inputs: [{ name: 'user', type: 'address' }],   outputs: [{ name: '', type: 'uint256' }] },
  { name: 'totalStaked',      type: 'function', stateMutability: 'view',       inputs: [],                                     outputs: [{ name: '', type: 'uint256' }] },
] as const

export const FEE_COLLECTOR_ABI = [
  { name: 'deposit',            type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }],   outputs: [] },
  { name: 'withdraw',           type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }],   outputs: [] },
  { name: 'userBalance',        type: 'function', stateMutability: 'view',       inputs: [{ name: '', type: 'address' }],         outputs: [{ name: '', type: 'uint256' }] },
  { name: 'totalFeesCollected', type: 'function', stateMutability: 'view',       inputs: [],                                       outputs: [{ name: '', type: 'uint256' }] },
  { name: 'totalBurned',        type: 'function', stateMutability: 'view',       inputs: [],                                       outputs: [{ name: '', type: 'uint256' }] },
  { name: 'burnBps',            type: 'function', stateMutability: 'view',       inputs: [],                                       outputs: [{ name: '', type: 'uint256' }] },
  { name: 'stakeBps',           type: 'function', stateMutability: 'view',       inputs: [],                                       outputs: [{ name: '', type: 'uint256' }] },
] as const
