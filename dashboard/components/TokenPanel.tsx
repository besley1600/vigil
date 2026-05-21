'use client'

import { useEffect, useState } from 'react'
import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useConnect } from 'wagmi'
import { base } from 'wagmi/chains'
import { parseEther, formatEther } from 'viem'
import { TOKEN_ABI, STAKING_ABI, FEE_COLLECTOR_ABI, CONTRACTS } from '../lib/web3'

const TIERS = [
  { threshold: '1K',   discount: '5%',   bps: 500 },
  { threshold: '10K',  discount: '15%',  bps: 1500 },
  { threshold: '100K', discount: '30%',  bps: 3000 },
  { threshold: '1M',   discount: '50%',  bps: 5000 },
]

function fmt(value: bigint | undefined, dec = 2): string {
  if (value === undefined) return '—'
  const n = parseFloat(formatEther(value))
  return n.toLocaleString('en-US', { maximumFractionDigits: dec, minimumFractionDigits: 0 })
}

function discountLabel(bps: bigint | undefined): string {
  const n = Number(bps ?? 0n)
  const pct = n / 100
  if (pct === 0)  return '0% discount — stake to unlock'
  if (pct <= 5)   return `${pct}% discount — Tier 1`
  if (pct <= 15)  return `${pct}% discount — Tier 2`
  if (pct <= 30)  return `${pct}% discount — Tier 3`
  return             `${pct}% discount — Tier 4`
}

interface ActionRowProps {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  onPrimary: () => void
  primaryLabel: string
  primaryStyle?: 'orange' | 'indigo'
  disabled?: boolean
  onSecondary?: () => void
  secondaryLabel?: string
  secondaryPlaceholder?: string
  secondaryValue?: string
  onSecondaryChange?: (v: string) => void
}

function ActionRow({
  label, placeholder, value, onChange, onPrimary, primaryLabel,
  primaryStyle = 'orange', disabled, onSecondary, secondaryLabel,
  secondaryPlaceholder, secondaryValue, onSecondaryChange,
}: ActionRowProps) {
  const btnClass = primaryStyle === 'indigo'
    ? 'bg-[#4F46E5] text-white'
    : 'bg-eva-orange text-white'

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-primary-40 uppercase tracking-wide">{label}</label>
        <div className="flex gap-2">
          <input
            type="number" min="0" value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-[#1A1A1E] border border-[rgba(255,255,255,0.1)] text-primary-100 font-mono text-xs px-3 py-2 outline-none focus:border-[rgba(255,255,255,0.25)] placeholder:text-primary-30"
          />
          <button
            onClick={onPrimary}
            disabled={disabled || !value}
            className={`text-[10px] px-4 py-2 font-mono uppercase tracking-[1px] hover:opacity-90 transition-opacity disabled:opacity-40 ${btnClass}`}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
      {onSecondary && secondaryLabel && (
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-primary-40 uppercase tracking-wide">{secondaryLabel}</label>
          <div className="flex gap-2">
            <input
              type="number" min="0" value={secondaryValue ?? ''}
              onChange={e => onSecondaryChange?.(e.target.value)}
              placeholder={secondaryPlaceholder}
              className="flex-1 bg-[#1A1A1E] border border-[rgba(255,255,255,0.1)] text-primary-100 font-mono text-xs px-3 py-2 outline-none focus:border-[rgba(255,255,255,0.25)] placeholder:text-primary-30"
            />
            <button
              onClick={onSecondary}
              disabled={disabled || !secondaryValue}
              className="text-[10px] px-4 py-2 font-mono uppercase tracking-[1px] border border-[rgba(255,255,255,0.1)] text-primary-50 hover:border-[rgba(255,255,255,0.25)] transition-colors disabled:opacity-40"
            >
              Withdraw
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function TokenPanel() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { connect } = useConnect()

  const c = CONTRACTS[chainId ?? base.id]
  const deployed = !!(c?.token && c?.staking && c?.feeCollector)

  const [depositAmt,  setDepositAmt]  = useState('')
  const [withdrawAmt, setWithdrawAmt] = useState('')
  const [stakeAmt,    setStakeAmt]    = useState('')
  const [unstakeAmt,  setUnstakeAmt]  = useState('')

  const { data: txHash, writeContract, isPending: isWriting } = useWriteContract()
  const { isLoading: isTxPending, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash })
  const busy = isWriting || isTxPending

  // ─── Reads ─────────────────────────────────────────────────────────────────
  const { data: walletBal,    refetch: rWallet }   = useReadContract({ address: c?.token,        abi: TOKEN_ABI,         functionName: 'balanceOf',         args: address ? [address] : undefined,                      query: { enabled: !!address && !!c?.token } })
  const { data: depositedBal, refetch: rDeposited } = useReadContract({ address: c?.feeCollector, abi: FEE_COLLECTOR_ABI, functionName: 'userBalance',        args: address ? [address] : undefined,                      query: { enabled: !!address && !!c?.feeCollector } })
  const { data: stakeInfo,    refetch: rStake }     = useReadContract({ address: c?.staking,      abi: STAKING_ABI,       functionName: 'userInfo',           args: address ? [address] : undefined,                      query: { enabled: !!address && !!c?.staking } })
  const { data: discountBps }                       = useReadContract({ address: c?.staking,      abi: STAKING_ABI,       functionName: 'getDiscountBps',     args: address ? [address] : undefined,                      query: { enabled: !!address && !!c?.staking } })
  const { data: pendingRew,   refetch: rRewards }   = useReadContract({ address: c?.staking,      abi: STAKING_ABI,       functionName: 'pendingRewardsFor',  args: address ? [address] : undefined,                      query: { enabled: !!address && !!c?.staking } })
  const { data: depositAllow, refetch: rDA }        = useReadContract({ address: c?.token,        abi: TOKEN_ABI,         functionName: 'allowance',          args: address && c?.feeCollector ? [address, c.feeCollector] : undefined, query: { enabled: !!address && !!c?.token && !!c?.feeCollector } })
  const { data: stakeAllow,   refetch: rSA }        = useReadContract({ address: c?.token,        abi: TOKEN_ABI,         functionName: 'allowance',          args: address && c?.staking ? [address, c.staking] : undefined,          query: { enabled: !!address && !!c?.token && !!c?.staking } })
  const { data: totalBurned }                       = useReadContract({ address: c?.feeCollector, abi: FEE_COLLECTOR_ABI, functionName: 'totalBurned',        query: { enabled: !!c?.feeCollector } })
  const { data: totalFees }                         = useReadContract({ address: c?.feeCollector, abi: FEE_COLLECTOR_ABI, functionName: 'totalFeesCollected', query: { enabled: !!c?.feeCollector } })

  const refetchAll = () => { rWallet(); rDeposited(); rStake(); rRewards(); rDA(); rSA() }

  useEffect(() => { if (isTxSuccess) refetchAll() }, [isTxSuccess])

  // ─── Derived ───────────────────────────────────────────────────────────────
  const depositAmtBig = depositAmt ? parseEther(depositAmt) : 0n
  const stakeAmtBig   = stakeAmt   ? parseEther(stakeAmt)   : 0n
  const stakedAmt     = stakeInfo?.[0] ?? 0n

  const needDepositApproval = (depositAllow ?? 0n) < depositAmtBig && depositAmtBig > 0n
  const needStakeApproval   = (stakeAllow   ?? 0n) < stakeAmtBig   && stakeAmtBig   > 0n

  const activeTierIdx = TIERS.reduceRight((acc, t, i) => {
    if (acc !== -1) return acc
    return stakedAmt >= parseEther(t.threshold.replace('K', '000').replace('M', '000000')) ? i : -1
  }, -1)

  // ─── Write helpers ─────────────────────────────────────────────────────────
  const w = (args: Parameters<typeof writeContract>[0]) => writeContract(args)

  const approveDeposit = () => c?.token && c?.feeCollector && w({ address: c.token, abi: TOKEN_ABI, functionName: 'approve', args: [c.feeCollector, depositAmtBig] })
  const doDeposit      = () => c?.feeCollector && w({ address: c.feeCollector, abi: FEE_COLLECTOR_ABI, functionName: 'deposit',  args: [depositAmtBig] })
  const doWithdraw     = () => c?.feeCollector && withdrawAmt && w({ address: c.feeCollector, abi: FEE_COLLECTOR_ABI, functionName: 'withdraw', args: [parseEther(withdrawAmt)] })
  const approveStake   = () => c?.token && c?.staking && w({ address: c.token, abi: TOKEN_ABI, functionName: 'approve', args: [c.staking, stakeAmtBig] })
  const doStake        = () => c?.staking && w({ address: c.staking, abi: STAKING_ABI, functionName: 'stake',   args: [stakeAmtBig] })
  const doUnstake      = () => c?.staking && unstakeAmt && w({ address: c.staking, abi: STAKING_ABI, functionName: 'unstake', args: [parseEther(unstakeAmt)] })
  const doClaim        = () => c?.staking && w({ address: c.staking, abi: STAKING_ABI, functionName: 'claimRewards', args: [] })

  // ─── Render ────────────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-64">
        <div className="text-center space-y-4">
          <div className="text-primary-40 font-mono text-xs uppercase tracking-widest">VIGIL Token</div>
          <p className="text-primary-50 font-mono text-sm">Connect your wallet to manage VIGIL</p>
          <button
            onClick={() => connect({ connector: injected() })}
            className="bg-[#4F46E5] text-white text-[10px] px-6 py-2.5 font-mono uppercase tracking-[1px] hover:opacity-90 transition-opacity"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  if (!deployed) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-64">
        <div className="text-center space-y-2">
          <div className="text-primary-40 font-mono text-xs uppercase tracking-widest">VIGIL Token</div>
          <p className="text-primary-50 font-mono text-xs">Contracts not yet deployed on this network.</p>
          <p className="text-primary-30 font-mono text-xs">Switch to Base after deployment and set contract addresses in .env.local.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-5">

      {/* Global stats bar */}
      <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-primary-40">
        <div className="bg-[#0D0D11] border border-[rgba(255,255,255,0.06)] px-4 py-2 flex justify-between">
          <span>Total fees collected</span>
          <span className="text-primary-70">{fmt(totalFees)} VIGIL</span>
        </div>
        <div className="bg-[#0D0D11] border border-[rgba(255,255,255,0.06)] px-4 py-2 flex justify-between">
          <span>Total burned</span>
          <span className="text-eva-orange">{fmt(totalBurned)} VIGIL</span>
        </div>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Wallet Balance', value: fmt(walletBal),    sub: 'VIGIL in wallet',    color: 'text-primary-100' },
          { label: 'API Balance',    value: fmt(depositedBal), sub: 'deposited for fees', color: 'text-primary-100' },
          { label: 'Staked',         value: fmt(stakedAmt),    sub: discountLabel(discountBps), color: 'text-[#4F46E5]' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-[#0E0E12] border border-[rgba(255,255,255,0.07)] p-4">
            <div className="text-[10px] font-mono text-primary-40 uppercase tracking-widest mb-1.5">{label}</div>
            <div className={`text-2xl font-mono ${color} leading-none`}>{value}</div>
            <div className="text-[10px] font-mono text-primary-40 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Pending rewards banner */}
      {(pendingRew ?? 0n) > 0n && (
        <div className="flex items-center justify-between bg-[#4F46E5]/10 border border-[#4F46E5]/25 px-4 py-3">
          <div>
            <span className="text-xs font-mono text-[#4F46E5]">{fmt(pendingRew)} VIGIL</span>
            <span className="text-[10px] font-mono text-primary-50 ml-2">staking rewards claimable</span>
          </div>
          <button
            onClick={doClaim}
            disabled={busy}
            className="text-[10px] font-mono uppercase tracking-[1px] bg-[#4F46E5] text-white px-4 py-1.5 hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {busy ? '...' : 'Claim'}
          </button>
        </div>
      )}

      {/* Action panels */}
      <div className="grid grid-cols-2 gap-5">

        {/* Fee Deposit */}
        <div className="bg-[#0E0E12] border border-[rgba(255,255,255,0.07)] p-5 space-y-4">
          <div className="text-[10px] font-mono text-primary-40 uppercase tracking-widest">API Fee Balance</div>
          <p className="text-[11px] font-mono text-primary-50 leading-relaxed">
            Pre-deposit VIGIL to fund your API usage. The platform deducts fees from this balance.
          </p>
          <ActionRow
            label="Deposit" placeholder="amount" value={depositAmt} onChange={setDepositAmt}
            onPrimary={needDepositApproval ? approveDeposit : doDeposit}
            primaryLabel={busy ? '...' : needDepositApproval ? 'Approve' : 'Deposit'}
            primaryStyle="orange" disabled={busy}
            onSecondary={doWithdraw} secondaryLabel="Withdraw"
            secondaryPlaceholder={`max ${fmt(depositedBal, 0)}`}
            secondaryValue={withdrawAmt} onSecondaryChange={setWithdrawAmt}
          />
        </div>

        {/* Staking */}
        <div className="bg-[#0E0E12] border border-[rgba(255,255,255,0.07)] p-5 space-y-4">
          <div className="text-[10px] font-mono text-primary-40 uppercase tracking-widest">Staking</div>
          <p className="text-[11px] font-mono text-primary-50 leading-relaxed">
            Stake VIGIL to earn a share of platform fees and reduce your own API costs.
          </p>
          <ActionRow
            label="Stake" placeholder="amount" value={stakeAmt} onChange={setStakeAmt}
            onPrimary={needStakeApproval ? approveStake : doStake}
            primaryLabel={busy ? '...' : needStakeApproval ? 'Approve' : 'Stake'}
            primaryStyle="indigo" disabled={busy}
            onSecondary={doUnstake} secondaryLabel="Unstake"
            secondaryPlaceholder={`max ${fmt(stakedAmt, 0)}`}
            secondaryValue={unstakeAmt} onSecondaryChange={setUnstakeAmt}
          />

          {/* Tier ladder */}
          <div className="pt-1 space-y-1.5">
            <div className="text-[10px] font-mono text-primary-30 uppercase tracking-widest">Discount Tiers</div>
            {TIERS.map((t, i) => (
              <div key={t.bps} className={`flex justify-between text-[10px] font-mono ${i === activeTierIdx ? 'text-[#4F46E5]' : 'text-primary-40'}`}>
                <span>≥ {t.threshold} VIGIL</span>
                <span>{t.discount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
