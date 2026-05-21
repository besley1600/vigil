'use client'

import { useState, useEffect } from 'react'
import { features } from '../lib/features'

interface AnalyticsData {
  skills: Array<{ name: string; total: number; success: number; failure: number; cancelled: number; inProgress: number; successRate: number; lastRun: string | null; lastConclusion: string | null; avgDurationMin: number | null; streak: number }>
  insights: Array<{ type: 'warning' | 'info' | 'success'; message: string }>
  summary: { totalRuns: number; totalSuccess: number; totalFailure: number; overallSuccessRate: number; uniqueSkills: number; periodDays: number }
}
interface QualityEntry { name: string; avgScore: number | null; recentScores: number[]; status: 'healthy' | 'degraded' | 'critical' | 'no-data'; consecutiveFailures: number; successRate: number | null; lastRun: string | null }
interface QualityData { qualities: QualityEntry[]; summary: { total: number; healthy: number; degraded: number; critical: number; noData: number; avgScore: number | null } }
interface CostsData { available: boolean; days?: number; total?: number; dailyAvg?: number; projected30d?: number; bySkill?: Array<{ name: string; runs: number; cost: number; avgCost: number; tokens: number }>; byModel?: Array<{ name: string; runs: number; cost: number; tokens: number }>; message?: string }
interface GatewayData { totalFees: number; totalRuns: number; feeRate: number; recent: Array<{ id: string; timestamp: string; skill: string; model: string; claudeCost: number; fee: number }> }

interface AnalyticsViewProps {
  analyticsData: AnalyticsData | null
  onFetchAnalytics: () => void
}

function SectionHeader({ title }: { title: string }) { return <div className="text-label mb-[var(--space-sm)]">{title}</div> }

function SkeletonBar({ className = '' }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-sm ${className}`} />
}

function SkeletonCard() {
  return (
    <div className="card-hst p-4">
      <SkeletonBar className="w-16 h-2 mb-3" />
      <SkeletonBar className="w-20 h-6" />
    </div>
  )
}

function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  const shapes = ['w-3 h-3 shrink-0', 'w-32 h-2 shrink-0', 'h-2 grow', 'w-10 h-2 shrink-0', 'w-8 h-2 shrink-0']
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {shapes.slice(0, cols).map((cls, i) => <SkeletonBar key={i} className={cls} />)}
    </div>
  )
}

function PerformanceSkeleton() {
  return (
    <div className="space-y-[var(--space-md)]">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[var(--space-sm)]">
        {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
      </div>
      <div className="card-hst divide-y divide-[rgba(255,255,255,0.06)]">
        {[0,1,2,3,4,5,6,7].map(i => <SkeletonTableRow key={i} />)}
      </div>
    </div>
  )
}

function HealthSkeleton() {
  return (
    <div className="space-y-[var(--space-md)]">
      <div className="grid grid-cols-3 gap-[var(--space-sm)]">
        {[0,1,2].map(i => <SkeletonCard key={i} />)}
      </div>
      <div className="card-hst divide-y divide-[rgba(255,255,255,0.06)]">
        {[0,1,2,3,4].map(i => <SkeletonTableRow key={i} cols={3} />)}
      </div>
    </div>
  )
}

function CostsSkeleton() {
  return (
    <div className="space-y-[var(--space-md)]">
      <div className="flex gap-1">
        {[0,1,2].map(i => <SkeletonBar key={i} className="w-10 h-7" />)}
      </div>
      <div className="grid grid-cols-2 gap-[var(--space-sm)]">
        {[0,1].map(i => <SkeletonCard key={i} />)}
      </div>
      <div className="card-hst divide-y divide-[rgba(255,255,255,0.06)]">
        {[0,1,2,3].map(i => <SkeletonTableRow key={i} cols={3} />)}
      </div>
    </div>
  )
}

function StatCard({ label, value, colorCls = '', accent = '' }: { label: string; value: string | number; colorCls?: string; accent?: string }) {
  return (
    <div className={`card-hst p-4 ${accent}`}>
      <div className="text-label">{label}</div>
      <div className={`font-display text-2xl mt-1 ${colorCls}`}>{value}</div>
    </div>
  )
}

export function AnalyticsView({ analyticsData, onFetchAnalytics }: AnalyticsViewProps) {
  const [qualityData, setQualityData] = useState<QualityData | null>(null)
  const [qualityLoading, setQualityLoading] = useState(false)
  const [costsData, setCostsData] = useState<CostsData | null>(null)
  const [costsLoading, setCostsLoading] = useState(false)
  const [costsDays, setCostsDays] = useState(7)
  const [gatewayData, setGatewayData] = useState<GatewayData | null>(null)

  useEffect(() => {
    onFetchAnalytics()
    if (features.QUALITY) {
      const fetchQ = async () => { setQualityLoading(true); try { const r = await fetch('/api/quality'); if (r.ok) setQualityData(await r.json()) } catch {} finally { setQualityLoading(false) } }
      fetchQ()
    }
    if (features.COSTS) {
      const fetchC = async (d: number) => { setCostsLoading(true); try { const r = await fetch(`/api/costs?days=${d}`); if (r.ok) setCostsData(await r.json()) } catch {} finally { setCostsLoading(false) } }
      fetchC(7)
      fetch('/api/gateway').then(r => r.ok ? r.json() : null).then(d => { if (d) setGatewayData(d) }).catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCosts = async (days: number) => {
    setCostsDays(days); setCostsLoading(true)
    try { const r = await fetch(`/api/costs?days=${days}`); if (r.ok) setCostsData(await r.json()) } catch {} finally { setCostsLoading(false) }
  }

  const maxTotal = analyticsData ? Math.max(...analyticsData.skills.map(s => s.total), 1) : 1

  return (
    <div className="max-w-5xl mx-auto py-[var(--space-lg)] px-[var(--space-lg)] space-y-[var(--space-xl)]">

      {/* Performance */}
      <section>
        <SectionHeader title="Performance" />
        {!analyticsData ? <PerformanceSkeleton /> : (
          <div className="space-y-[var(--space-md)]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-[var(--space-sm)]">
              <StatCard label="Total Runs" value={analyticsData.summary.totalRuns} accent="stat-accent-indigo" />
              <StatCard label="Success Rate" value={`${analyticsData.summary.overallSuccessRate}%`}
                colorCls={analyticsData.summary.overallSuccessRate >= 80 ? 'text-eva-green' : analyticsData.summary.overallSuccessRate >= 50 ? 'text-eva-amber' : 'text-eva-red'} />
              <StatCard label="Active Skills" value={analyticsData.summary.uniqueSkills} />
              <StatCard label="Period" value={`${analyticsData.summary.periodDays}d`} />
            </div>
            {analyticsData.insights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {analyticsData.insights.map((ins, i) => (
                  <div key={i} className={`text-[11px] font-mono px-3 py-2 border ${
                    ins.type === 'warning' ? 'text-eva-amber bg-[rgba(251,146,60,0.08)] border-[rgba(251,146,60,0.25)]' :
                    ins.type === 'success' ? 'text-eva-green bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.25)]' :
                    'text-primary-70 bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.1)]'
                  }`}>{ins.message}</div>
                ))}
              </div>
            )}
            <div className="card-hst divide-y divide-[rgba(255,255,255,0.06)]">
              {analyticsData.skills.map(s => (
                <div key={s.name} className="flex items-center gap-3 px-4 py-2.5">
                  <span className={`text-xs w-3 text-center shrink-0 ${s.lastConclusion === 'success' ? 'text-eva-green' : s.lastConclusion === 'failure' ? 'text-eva-red' : 'text-primary-35'}`}>
                    {s.lastConclusion === 'success' ? '✓' : s.lastConclusion === 'failure' ? '✗' : '·'}
                  </span>
                  <span className="font-mono text-[11px] text-primary-70 w-36 truncate shrink-0">{s.name}</span>
                  <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.07)] overflow-hidden flex">
                    {s.success > 0 && <div className="bg-eva-green/60 h-full" style={{ width: `${(s.success / maxTotal) * 100}%` }} />}
                    {s.failure > 0 && <div className="bg-eva-red/40 h-full" style={{ width: `${(s.failure / maxTotal) * 100}%` }} />}
                  </div>
                  <span className={`text-[10px] font-mono tabular-nums w-10 text-right shrink-0 ${s.successRate >= 80 ? 'text-eva-green' : s.successRate >= 50 ? 'text-eva-amber' : 'text-eva-red'}`}>{s.successRate}%</span>
                  <span className="text-[10px] font-mono text-primary-35 tabular-nums w-8 text-right shrink-0">{s.total}×</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Health */}
      {features.QUALITY && <section>
        <SectionHeader title="Health" />
        {qualityLoading || !qualityData ? <HealthSkeleton /> : (
          <div className="space-y-[var(--space-md)]">
            <div className="grid grid-cols-3 gap-[var(--space-sm)]">
              <StatCard label="Healthy" value={qualityData.summary.healthy} colorCls="text-eva-green" />
              <StatCard label="Degraded" value={qualityData.summary.degraded} colorCls="text-eva-amber" />
              <StatCard label="Critical" value={qualityData.summary.critical} colorCls="text-eva-red" />
            </div>
            {qualityData.summary.avgScore !== null && (
              <div className="card-hst p-4 flex items-center gap-4">
                <div>
                  <div className="text-label">Fleet avg quality</div>
                  <div className="font-display text-3xl mt-0.5 text-eva-orange">{qualityData.summary.avgScore}<span className="text-sm font-mono text-primary-35">/5</span></div>
                </div>
                <div className="flex gap-1.5 ml-auto">
                  {[1,2,3,4,5].map(n => (
                    <div key={n} className="w-4 h-4 border-2" style={{ borderColor: n <= Math.round(qualityData.summary.avgScore ?? 0) ? 'var(--color-orange)' : 'rgba(255,255,255,0.12)', backgroundColor: n <= Math.round(qualityData.summary.avgScore ?? 0) ? 'var(--color-orange)' : 'transparent' }} />
                  ))}
                </div>
              </div>
            )}
            <div className="card-hst divide-y divide-[rgba(255,255,255,0.06)]">
              {qualityData.qualities.filter(q => q.status !== 'no-data').map(q => (
                <div key={q.name} className="flex items-center gap-3 px-4 py-2.5">
                  <span className={`text-[10px] font-mono ${q.status === 'healthy' ? 'text-eva-green' : q.status === 'degraded' ? 'text-eva-amber' : 'text-eva-red'}`}>
                    {q.status === 'healthy' ? '●' : q.status === 'degraded' ? '◐' : '○'}
                  </span>
                  <span className="font-mono text-[11px] text-primary-70 flex-1 truncate">{q.name}</span>
                  {q.avgScore !== null && <span className={`text-[10px] font-mono tabular-nums ${q.avgScore >= 4 ? 'text-eva-green' : q.avgScore >= 3 ? 'text-eva-amber' : 'text-eva-red'}`}>{q.avgScore}/5</span>}
                </div>
              ))}
              {qualityData.qualities.filter(q => q.status !== 'no-data').length === 0 && (
                <div className="px-4 py-10 text-center text-[11px] text-primary-35 font-mono">No quality data yet. Scores appear after each skill run.</div>
              )}
            </div>
          </div>
        )}
      </section>}

      {/* Costs */}
      {features.COSTS && <section>
        <SectionHeader title="Costs" />
        {costsLoading || !costsData ? <CostsSkeleton /> : !costsData.available ? (
          <div className="card-hst px-4 py-10 text-center text-[11px] text-primary-35 font-mono">
            {costsData.message || 'Cost tracking unavailable.'}<br />
            <span className="block mt-1">Enable the cost-report skill to start tracking.</span>
          </div>
        ) : (
          <div className="space-y-[var(--space-md)]">
            <div className="flex gap-1">
              {[7, 14, 30].map(d => (
                <button key={d} onClick={() => fetchCosts(d)}
                  className={`text-[10px] font-mono px-3 py-1.5 transition-colors ${costsDays === d ? 'bg-eva-orange text-white' : 'text-primary-40 border border-[rgba(255,255,255,0.1)] hover:text-primary-70'}`}>{d}d</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-[var(--space-sm)]">
              <StatCard label={`Total (${costsData.days}d)`} value={`$${costsData.total?.toFixed(4)}`} />
              <StatCard label="30d projection" value={`$${costsData.projected30d?.toFixed(2)}`} colorCls={(costsData.projected30d ?? 0) > 50 ? 'text-eva-red' : ''} />
            </div>
            {(costsData.bySkill ?? []).length > 0 && (
              <div className="card-hst">
                <div className="px-4 py-2 text-label border-b border-[rgba(255,255,255,0.06)]">By Skill</div>
                {(costsData.bySkill ?? []).map(s => (
                  <div key={s.name} className="flex items-center gap-3 px-4 py-2 border-b border-[rgba(255,255,255,0.05)]">
                    <span className="font-mono text-[10px] text-primary-60 flex-1 truncate">{s.name}</span>
                    <span className="text-[10px] font-mono text-primary-40 tabular-nums">{s.runs}×</span>
                    <span className="text-[10px] font-mono text-eva-orange tabular-nums">${s.cost.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            )}
            {(costsData.byModel ?? []).length > 0 && (
              <div className="card-hst">
                <div className="px-4 py-2 text-label border-b border-[rgba(255,255,255,0.06)]">By Model</div>
                {(costsData.byModel ?? []).map(m => (
                  <div key={m.name} className="flex items-center gap-3 px-4 py-2 border-b border-[rgba(255,255,255,0.05)]">
                    <span className="font-mono text-[10px] text-primary-50 flex-1 truncate">{m.name.replace('claude-', '')}</span>
                    <span className="text-[10px] font-mono text-eva-orange tabular-nums">${m.cost.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>}

      {/* Gateway Fees */}
      {features.COSTS && gatewayData && gatewayData.totalRuns > 0 && (
        <section>
          <SectionHeader title="Gateway Revenue" />
          <div className="space-y-[var(--space-md)]">
            <div className="grid grid-cols-3 gap-[var(--space-sm)]">
              <StatCard label="Total Fees" value={`$${gatewayData.totalFees.toFixed(4)}`} colorCls="text-eva-green" accent="stat-accent-indigo" />
              <StatCard label="Runs Billed" value={gatewayData.totalRuns} />
              <StatCard label="Fee Rate" value={`${(gatewayData.feeRate * 100).toFixed(0)}%`} colorCls="text-eva-orange" />
            </div>
            {gatewayData.recent.length > 0 && (
              <div className="card-hst">
                <div className="px-4 py-2 text-label border-b border-[rgba(255,255,255,0.06)]">Recent</div>
                {gatewayData.recent.slice(0, 10).map(r => (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-2 border-b border-[rgba(255,255,255,0.05)]">
                    <span className="font-mono text-[10px] text-primary-60 flex-1 truncate">{r.skill}</span>
                    <span className="text-[10px] font-mono text-primary-35">{r.model}</span>
                    <span className="text-[10px] font-mono text-eva-green tabular-nums">+${r.fee.toFixed(6)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  )
}
