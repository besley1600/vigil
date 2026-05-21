/**
 * Gateway API — proxies skill runs through Vigil's infrastructure,
 * recording a platform fee on each run. This is the economic primitive
 * that makes the token model work: every run through the gateway
 * accrues a fee, payable in Vigil token.
 *
 * Fee rate: VIGIL_FEE_RATE (default 0.08 = 8% of Claude API cost)
 * Fee ledger: memory/gateway-fees.json (append-only)
 */

import { NextResponse } from 'next/server'
import { resolve } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'

const REPO_ROOT   = resolve(process.cwd(), '..')
const MEMORY_DIR  = resolve(REPO_ROOT, 'memory')
const LEDGER_FILE = resolve(MEMORY_DIR, 'gateway-fees.json')
const FEE_RATE    = parseFloat(process.env.VIGIL_FEE_RATE ?? '0.08')

// Per-million-token pricing (direct Anthropic) — mirrors costs/route.ts
const PRICING: Record<string, { input: number; output: number }> = {
  'claude-opus-4-7':           { input: 15.00, output: 75.00 },
  'claude-sonnet-4-6':         { input:  3.00, output: 15.00 },
  'claude-haiku-4-5-20251001': { input:  0.80, output:  4.00 },
}
const FALLBACK = PRICING['claude-sonnet-4-6']

interface FeeEntry {
  id:           string
  timestamp:    string
  skill:        string
  model:        string
  inputTokens:  number
  outputTokens: number
  claudeCost:   number   // USD — raw Anthropic cost
  feeRate:      number
  fee:          number   // USD — platform fee
  walletAddress?: string // populated when token-gated
}

interface Ledger {
  totalFees:   number
  totalRuns:   number
  entries:     FeeEntry[]
}

function readLedger(): Ledger {
  try {
    if (existsSync(LEDGER_FILE)) {
      return JSON.parse(readFileSync(LEDGER_FILE, 'utf-8'))
    }
  } catch { /* first run */ }
  return { totalFees: 0, totalRuns: 0, entries: [] }
}

function writeLedger(ledger: Ledger) {
  if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true })
  // Keep last 1000 entries in the file; summarise older ones into totals
  if (ledger.entries.length > 1000) {
    const overflow = ledger.entries.splice(0, ledger.entries.length - 1000)
    ledger.totalFees += overflow.reduce((s, e) => s + e.fee, 0)
    ledger.totalRuns += overflow.length
  }
  writeFileSync(LEDGER_FILE, JSON.stringify(ledger, null, 2), 'utf-8')
}

// GET — return fee summary
export async function GET() {
  const ledger = readLedger()
  const recent = ledger.entries.slice(-50).reverse()

  const summary = {
    totalFees:     Math.round((ledger.totalFees + recent.reduce((s, e) => s + e.fee, 0)) * 10000) / 10000,
    totalRuns:     ledger.totalRuns + ledger.entries.length,
    feeRate:       FEE_RATE,
    recent:        recent.map(e => ({
      id:        e.id,
      timestamp: e.timestamp,
      skill:     e.skill,
      model:     e.model.replace('claude-', ''),
      claudeCost: e.claudeCost,
      fee:       e.fee,
    })),
  }

  return NextResponse.json(summary)
}

// POST — record a fee for a completed skill run
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { skill, model, inputTokens, outputTokens, walletAddress } = body as {
      skill: string
      model: string
      inputTokens: number
      outputTokens: number
      walletAddress?: string
    }

    if (!skill || !model || typeof inputTokens !== 'number' || typeof outputTokens !== 'number') {
      return NextResponse.json({ error: 'skill, model, inputTokens, outputTokens required' }, { status: 400 })
    }

    const pricing   = PRICING[model] ?? FALLBACK
    const claudeCost = (inputTokens / 1e6) * pricing.input + (outputTokens / 1e6) * pricing.output
    const fee        = claudeCost * FEE_RATE

    const entry: FeeEntry = {
      id:           `fee_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp:    new Date().toISOString(),
      skill,
      model,
      inputTokens,
      outputTokens,
      claudeCost:   Math.round(claudeCost * 1e6) / 1e6,
      feeRate:      FEE_RATE,
      fee:          Math.round(fee * 1e6) / 1e6,
      walletAddress,
    }

    const ledger = readLedger()
    ledger.entries.push(entry)
    writeLedger(ledger)

    return NextResponse.json({ ok: true, fee: entry.fee, feeRate: FEE_RATE })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to record fee'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
