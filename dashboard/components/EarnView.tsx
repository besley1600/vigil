'use client'

import { useState } from 'react'

const FRONTMATTER = `---
name: My Skill
description: What this skill does in one line
author: your-github-handle
wallet: "0xYourBaseWalletAddress"
var: ""
tags: [research]
---

> **\${var}** — Optional parameter operators can override.

Today is \${today}. [Describe what your skill does here.]

## Steps

1. **Fetch data** — use WebFetch or curl with a WebFetch fallback.
2. **Process** — filter, score, and summarise.
3. **Write output** — save to \`articles/my-skill-\${today}.md\`.
4. **Notify** — \`./notify "summary"\`
5. **Log** — append to \`memory/logs/\${today}.md\``.trim()

const STEPS = [
  {
    n: '01',
    title: 'Write your skill',
    body: 'Create skills/my-skill/SKILL.md. Add author and wallet to the frontmatter. Write natural language steps — Claude Code executes them.',
  },
  {
    n: '02',
    title: 'Test it locally',
    body: 'Install it into a local Vigil instance with ./add-skill and run it. Check the output makes sense before submitting.',
  },
  {
    n: '03',
    title: 'Submit to the registry',
    body: 'Open a PR to besley1600/vigil-skills. PRs are reviewed for security and quality. Merged skills are live immediately.',
  },
  {
    n: '04',
    title: 'Earn every Monday',
    body: 'Every Monday the skill-earnings skill runs and sends your pro-rata share of the weekly VIGIL pool to your wallet on Base as USDC.',
  },
]

const FLOW = [
  { label: 'Swap fee', value: '1.2%', sub: 'on every VIGIL trade — collected by Bankr', color: 'text-primary-50' },
  { label: "Vigil's cut", value: '57%', sub: 'of every swap fee flows to Vigil automatically', color: 'text-eva-orange' },
  { label: 'Creator pool', value: '50%', sub: 'of Vigil\'s cut, split by skill run contribution', color: 'text-eva-green' },
]

const SWAP_FEE   = 0.012  // 1.2% bankr swap fee
const CREATOR_CUT = 0.57  // 57% to token creator (Vigil)
const POOL_SHARE  = 0.50  // 50% of Vigil's cut goes to skill creators

export function EarnView() {
  const [runs, setRuns]           = useState('50')
  const [totalRuns, setTotalRuns] = useState('500')
  const [volume, setVolume]       = useState('10000')

  const runsN      = Math.max(0, parseInt(runs) || 0)
  const totalRunsN = Math.max(1, parseInt(totalRuns) || 1)
  const volumeN    = Math.max(0, parseFloat(volume) || 0)

  const vigilEarnings = volumeN * SWAP_FEE * CREATOR_CUT
  const poolTotal     = vigilEarnings * POOL_SHARE
  const share         = runsN / Math.max(totalRunsN, runsN)
  const estimated     = share * poolTotal

  const estimatedFmt  = estimated.toFixed(2)
  const poolFmt       = poolTotal.toFixed(2)
  const sharePct      = (share * 100).toFixed(1)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div className="bg-[#0E0E12] border border-[rgba(255,255,255,0.07)] p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-eva-orange/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative space-y-3">
          <div className="text-[10px] font-mono text-eva-orange uppercase tracking-[2.5px]">Skill Economy</div>
          <h1 className="font-display text-3xl text-primary-100 leading-tight">
            Build skills.<br />Earn passive income.
          </h1>
          <p className="text-[13px] font-mono text-primary-50 leading-relaxed max-w-xl">
            Vigil runs a token on Bankr. Every trade generates fees that flow into a weekly pool — distributed automatically to the skill creators whose work drove the platform's activity.
          </p>
          <div className="flex gap-6 pt-2">
            <div>
              <div className="text-xl font-mono text-eva-orange">57%</div>
              <div className="text-[10px] font-mono text-primary-40 uppercase tracking-wide">of swap fees to Vigil</div>
            </div>
            <div className="w-px bg-[rgba(255,255,255,0.07)]" />
            <div>
              <div className="text-xl font-mono text-primary-100">USDC</div>
              <div className="text-[10px] font-mono text-primary-40 uppercase tracking-wide">paid on Base weekly</div>
            </div>
            <div className="w-px bg-[rgba(255,255,255,0.07)]" />
            <div>
              <div className="text-xl font-mono text-primary-100">$0</div>
              <div className="text-[10px] font-mono text-primary-40 uppercase tracking-wide">cost to publish</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Fee flow ───────────────────────────────────────────────────── */}
      <div>
        <div className="text-[10px] font-mono text-primary-40 uppercase tracking-[2.5px] mb-3">How fees flow</div>
        <div className="grid grid-cols-3 gap-3">
          {FLOW.map((f, i) => (
            <div key={f.label} className="bg-[#0E0E12] border border-[rgba(255,255,255,0.07)] p-4 space-y-1.5">
              <div className="text-[10px] font-mono text-primary-40 uppercase tracking-wide flex items-center gap-2">
                <span className="text-primary-30">{String(i + 1).padStart(2, '0')}</span>
                {f.label}
              </div>
              <div className={`text-2xl font-mono ${f.color} leading-none`}>{f.value}</div>
              <div className="text-[10px] font-mono text-primary-40 leading-relaxed">{f.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Steps + Frontmatter ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-5">

        {/* Steps */}
        <div className="space-y-3">
          <div className="text-[10px] font-mono text-primary-40 uppercase tracking-[2.5px]">From zero to earning</div>
          {STEPS.map((s) => (
            <div key={s.n} className="bg-[#0E0E12] border border-[rgba(255,255,255,0.07)] p-4 flex gap-4">
              <div className="text-[10px] font-mono text-eva-orange shrink-0 pt-0.5">{s.n}</div>
              <div className="space-y-1">
                <div className="text-xs font-mono text-primary-100">{s.title}</div>
                <div className="text-[11px] font-mono text-primary-50 leading-relaxed">{s.body}</div>
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <a
              href="https://github.com/besley1600/vigil-skills"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-[10px] font-mono uppercase tracking-[1px] bg-eva-orange text-white px-4 py-2.5 hover:opacity-90 transition-opacity"
            >
              Submit a skill →
            </a>
            <a
              href="https://docs.bankr.bot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono uppercase tracking-[1px] border border-[rgba(255,255,255,0.1)] text-primary-50 px-4 py-2.5 hover:border-[rgba(255,255,255,0.25)] transition-colors"
            >
              Bankr docs
            </a>
          </div>
        </div>

        {/* Frontmatter */}
        <div className="space-y-3">
          <div className="text-[10px] font-mono text-primary-40 uppercase tracking-[2.5px]">Skill frontmatter</div>
          <div className="bg-[#0D0D10] border border-[rgba(255,255,255,0.07)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(255,255,255,0.06)]">
              <span className="text-[10px] font-mono text-primary-40">skills/my-skill/SKILL.md</span>
              <span className="text-[10px] font-mono text-eva-green uppercase tracking-wide">Required fields</span>
            </div>
            <pre className="text-[11px] font-mono text-primary-70 p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">
              {FRONTMATTER.split('\n').map((line, i) => {
                const isKey = /^(author|wallet):/.test(line)
                return (
                  <span key={i} className={isKey ? 'text-eva-green' : undefined}>
                    {line}
                    {'\n'}
                  </span>
                )
              })}
            </pre>
          </div>
          <div className="bg-[#0E0E12] border border-[rgba(255,255,255,0.07)] p-3 space-y-1.5">
            <div className="text-[10px] font-mono text-primary-40 uppercase tracking-wide">Required fields</div>
            {[
              { field: 'author', desc: 'Your GitHub username — shown in the registry' },
              { field: 'wallet', desc: 'Your Base wallet — where USDC lands weekly' },
            ].map(({ field, desc }) => (
              <div key={field} className="flex gap-3 text-[11px] font-mono">
                <span className="text-eva-green shrink-0">{field}</span>
                <span className="text-primary-40">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Earnings estimator ─────────────────────────────────────────── */}
      <div className="bg-[#0E0E12] border border-[rgba(255,255,255,0.07)] p-5 space-y-4">
        <div className="text-[10px] font-mono text-primary-40 uppercase tracking-[2.5px]">Earnings estimator</div>
        <p className="text-[11px] font-mono text-primary-50 leading-relaxed">
          Your earnings come directly from VIGIL token trading volume — no fixed budget, no discretionary top-ups. 50% of Vigil's bankr cut flows to the creator pool each week.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'VIGIL trading volume / week ($)', state: volume,    set: setVolume,    placeholder: '10000' },
            { label: 'Your skill runs / week',          state: runs,      set: setRuns,      placeholder: '50' },
            { label: 'Total platform runs / week',      state: totalRuns, set: setTotalRuns, placeholder: '500' },
          ].map(({ label, state, set, placeholder }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-[10px] font-mono text-primary-40 uppercase tracking-wide">{label}</label>
              <input
                type="number"
                min="0"
                value={state}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[#1A1A1E] border border-[rgba(255,255,255,0.1)] text-primary-100 font-mono text-xs px-3 py-2 outline-none focus:border-[rgba(255,255,255,0.25)] placeholder:text-primary-30"
              />
            </div>
          ))}
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] font-mono text-primary-40">
          <div className="bg-[#0D0D10] border border-[rgba(255,255,255,0.06)] px-3 py-2 flex justify-between">
            <span>Bankr fees (1.2%)</span>
            <span className="text-primary-70">${(volumeN * SWAP_FEE).toFixed(2)}</span>
          </div>
          <div className="bg-[#0D0D10] border border-[rgba(255,255,255,0.06)] px-3 py-2 flex justify-between">
            <span>Vigil's cut (57%)</span>
            <span className="text-primary-70">${vigilEarnings.toFixed(2)}</span>
          </div>
          <div className="bg-[#0D0D10] border border-[rgba(255,255,255,0.06)] px-3 py-2 flex justify-between">
            <span>Creator pool (50%)</span>
            <span className="text-eva-orange">${poolFmt}</span>
          </div>
        </div>

        <div className="flex items-baseline gap-4 border-t border-[rgba(255,255,255,0.06)] pt-4">
          <div className="text-3xl font-mono text-eva-green">${estimatedFmt}</div>
          <div className="text-[11px] font-mono text-primary-40">your estimated USDC / week</div>
          <div className="text-[11px] font-mono text-primary-30">({sharePct}% of ${poolFmt} pool)</div>
        </div>
        <p className="text-[10px] font-mono text-primary-30 leading-relaxed">
          Actual earnings depend on weekly VIGIL trading volume and your skill's share of total platform runs.
        </p>
      </div>

      {/* ── How the pool grows ─────────────────────────────────────────── */}
      <div className="bg-[#0E0E12] border border-[rgba(255,255,255,0.07)] p-5 space-y-4">
        <div className="text-[10px] font-mono text-primary-40 uppercase tracking-[2.5px]">How the pool grows</div>
        <p className="text-[11px] font-mono text-primary-50 leading-relaxed">
          Vigil holds a VIGIL token on Bankr. Every time it trades, 57% of the 1.2% swap fee flows to Vigil automatically. Those earnings fund the weekly creator pool — no manual top-ups, no operator configuration needed.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'More skills', sub: 'attract more users and activity to the platform' },
            { label: 'More users', sub: 'drive trading volume on the VIGIL token' },
            { label: 'More volume', sub: 'means a larger pool for all skill creators' },
          ].map(({ label, sub }) => (
            <div key={label} className="bg-[#0D0D10] border border-[rgba(255,255,255,0.06)] p-4 space-y-1.5">
              <div className="text-xs font-mono text-primary-100">{label}</div>
              <div className="text-[10px] font-mono text-primary-40 leading-relaxed">{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick links ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Developer docs', sub: 'Full skill authoring guide', href: 'https://github.com/besley1600/vigil/blob/main/docs/skill-economy.md' },
          { label: 'Skills registry', sub: 'Browse & submit community skills', href: 'https://github.com/besley1600/vigil-skills' },
          { label: 'Bankr discover', sub: 'See active agent tokens', href: 'https://bankr.bot/discover' },
        ].map(({ label, sub, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0E0E12] border border-[rgba(255,255,255,0.07)] p-4 hover:border-[rgba(255,255,255,0.15)] transition-colors group block"
          >
            <div className="text-xs font-mono text-primary-100 group-hover:text-eva-orange transition-colors">{label} →</div>
            <div className="text-[10px] font-mono text-primary-40 mt-1">{sub}</div>
          </a>
        ))}
      </div>

    </div>
  )
}
