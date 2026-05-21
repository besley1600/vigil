import { NextResponse } from 'next/server'
import { getFileContent } from '@/lib/github'

// Per-million-token pricing (direct Anthropic)
const PRICING: Record<string, { input: number; output: number; cacheRead: number; cacheWrite: number }> = {
  'claude-opus-4-7':             { input: 15.00, output: 75.00, cacheRead: 1.50,  cacheWrite: 18.75 },
  'claude-sonnet-4-6':           { input:  3.00, output: 15.00, cacheRead: 0.30,  cacheWrite:  3.75 },
  'claude-haiku-4-5-20251001':   { input:  0.80, output:  4.00, cacheRead: 0.08,  cacheWrite:  1.00 },
}
const FALLBACK_PRICE = PRICING['claude-opus-4-7']

function calcCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheRead: number,
  cacheWrite: number,
): number {
  const p = PRICING[model] ?? FALLBACK_PRICE
  return (
    (inputTokens   / 1e6) * p.input      +
    (outputTokens  / 1e6) * p.output     +
    (cacheRead     / 1e6) * p.cacheRead  +
    (cacheWrite    / 1e6) * p.cacheWrite
  )
}

interface CostRow {
  date: string
  skill: string
  model: string
  inputTokens: number
  outputTokens: number
  cacheRead: number
  cacheWrite: number
  cost: number
}

async function parseCSV(): Promise<CostRow[]> {
  try {
    const { content } = await getFileContent('memory/token-usage.csv')
    const lines = content.split('\n').filter(Boolean)
    if (lines.length < 2) return []

    const rows: CostRow[] = []
    for (const line of lines.slice(1)) {
      const parts = line.split(',')
      if (parts.length < 5) continue
      const [date, skill, model, inp, out, cr = '0', cw = '0'] = parts
      const inputTokens  = parseInt(inp  ?? '0', 10)  || 0
      const outputTokens = parseInt(out  ?? '0', 10)  || 0
      const cacheRead    = parseInt(cr   ?? '0', 10)  || 0
      const cacheWrite   = parseInt(cw   ?? '0', 10)  || 0
      rows.push({
        date: date?.trim() ?? '',
        skill: skill?.trim() ?? '',
        model: model?.trim() ?? '',
        inputTokens,
        outputTokens,
        cacheRead,
        cacheWrite,
        cost: calcCost(model?.trim() ?? '', inputTokens, outputTokens, cacheRead, cacheWrite),
      })
    }
    return rows
  } catch {
    return []
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') ?? '7', 10) || 7

  const allRows = await parseCSV()

  if (!allRows.length) {
    return NextResponse.json({ available: false, message: 'No token-usage.csv found yet — runs cost data after the first skill execution.' })
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split('T')[0]

  const rows = allRows.filter(r => r.date >= cutoffStr)

  if (!rows.length) {
    return NextResponse.json({ available: true, rows: 0, total: 0, bySkill: [], byModel: [], days })
  }

  const skillMap = new Map<string, { runs: number; cost: number; tokens: number }>()
  const modelMap = new Map<string, { runs: number; cost: number; tokens: number }>()

  let total = 0
  for (const r of rows) {
    total += r.cost
    const tokens = r.inputTokens + r.outputTokens

    const s = skillMap.get(r.skill) ?? { runs: 0, cost: 0, tokens: 0 }
    s.runs++; s.cost += r.cost; s.tokens += tokens
    skillMap.set(r.skill, s)

    const m = modelMap.get(r.model) ?? { runs: 0, cost: 0, tokens: 0 }
    m.runs++; m.cost += r.cost; m.tokens += tokens
    modelMap.set(r.model, m)
  }

  const bySkill = [...skillMap.entries()]
    .map(([name, d]) => ({ name, ...d, avgCost: d.cost / d.runs }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 15)

  const byModel = [...modelMap.entries()]
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.cost - a.cost)

  const dailyAvg = total / days
  const projected30d = dailyAvg * 30

  return NextResponse.json({
    available: true,
    days,
    rows: rows.length,
    total: Math.round(total * 10000) / 10000,
    dailyAvg: Math.round(dailyAvg * 10000) / 10000,
    projected30d: Math.round(projected30d * 100) / 100,
    bySkill: bySkill.map(s => ({ ...s, cost: Math.round(s.cost * 10000) / 10000, avgCost: Math.round(s.avgCost * 10000) / 10000 })),
    byModel: byModel.map(m => ({ ...m, cost: Math.round(m.cost * 10000) / 10000 })),
  })
}
