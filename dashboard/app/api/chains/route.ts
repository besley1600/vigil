import { NextResponse } from 'next/server'
import { resolve } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { parseDocument, isMap, isSeq, isPair, isScalar } from 'yaml'

const REPO_ROOT = resolve(process.cwd(), '..')
const VIGIL_YML = resolve(REPO_ROOT, 'vigil.yml')
const CHAIN_NAME_RE = /^[a-z][a-z0-9-]*$/

export interface ChainStep {
  type: 'parallel' | 'sequential'
  skills: string[]
  consume?: string[]
}

export interface Chain {
  name: string
  schedule?: string
  onError?: 'fail-fast' | 'continue'
  steps: ChainStep[]
}

function parseChains(raw: string): Chain[] {
  const doc = parseDocument(raw)
  const chainsNode = doc.get('chains')
  if (!isMap(chainsNode)) return []

  const chains: Chain[] = []

  for (const item of chainsNode.items) {
    if (!isPair(item) || !isScalar(item.key)) continue
    const name = String(item.key.value)
    const val = item.value
    if (!isMap(val)) continue

    const chain: Chain = { name, steps: [] }

    const schedule = val.get('schedule')
    if (schedule) chain.schedule = String(schedule)

    const onError = val.get('on_error')
    if (onError === 'fail-fast' || onError === 'continue') chain.onError = onError

    const stepsNode = val.get('steps', true)
    if (isSeq(stepsNode)) {
      for (const stepNode of stepsNode.items) {
        if (!isMap(stepNode)) continue

        const parallel = stepNode.get('parallel', true)
        if (isSeq(parallel)) {
          chain.steps.push({
            type: 'parallel',
            skills: parallel.items.filter(isScalar).map(s => String(s.value)).filter(Boolean),
          })
          continue
        }

        const skillName = stepNode.get('skill')
        if (skillName) {
          const consumeNode = stepNode.get('consume', true)
          const consume = isSeq(consumeNode)
            ? consumeNode.items.filter(isScalar).map(s => String(s.value))
            : undefined
          chain.steps.push({ type: 'sequential', skills: [String(skillName)], consume })
        }
      }
    }

    if (chain.steps.length > 0) chains.push(chain)
  }

  return chains
}

function upsertChain(raw: string, chain: Chain): string {
  const doc = parseDocument(raw)

  // Ensure top-level chains: map exists
  if (!isMap(doc.get('chains', true))) {
    doc.set('chains', doc.createNode({}))
  }
  const chainsNode = doc.get('chains', true)
  if (!isMap(chainsNode)) throw new Error('Failed to create chains map')

  // Build plain JS representation of the chain
  const chainObj: Record<string, unknown> = {}
  if (chain.schedule) chainObj.schedule = chain.schedule
  if (chain.onError) chainObj.on_error = chain.onError

  chainObj.steps = chain.steps.map(step => {
    if (step.type === 'parallel') {
      return { parallel: step.skills }
    }
    const s: Record<string, unknown> = { skill: step.skills[0] }
    if (step.consume && step.consume.length > 0) s.consume = step.consume
    return s
  })

  chainsNode.set(chain.name, doc.createNode(chainObj))
  return doc.toString()
}

function removeChain(raw: string, name: string): string {
  const doc = parseDocument(raw)
  const chainsNode = doc.get('chains', true)
  if (isMap(chainsNode)) chainsNode.delete(name)
  return doc.toString()
}

export async function GET() {
  try {
    if (!existsSync(VIGIL_YML)) {
      return NextResponse.json({ chains: [], available: false })
    }
    const raw = readFileSync(VIGIL_YML, 'utf-8')
    const chains = parseChains(raw)
    return NextResponse.json({ chains, available: true })
  } catch {
    return NextResponse.json({ chains: [], available: false })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const chain = body.chain as Chain | undefined

    if (!chain || !chain.name || !CHAIN_NAME_RE.test(chain.name)) {
      return NextResponse.json({ error: 'Invalid chain name (must be lowercase-with-dashes)' }, { status: 400 })
    }
    if (!chain.steps || chain.steps.length === 0) {
      return NextResponse.json({ error: 'Chain must have at least one step' }, { status: 400 })
    }

    // Validate all skill names within steps
    for (const step of chain.steps) {
      if (!step.skills || step.skills.length === 0) {
        return NextResponse.json({ error: 'Each step must have at least one skill' }, { status: 400 })
      }
      for (const s of step.skills) {
        if (!CHAIN_NAME_RE.test(s)) {
          return NextResponse.json({ error: `Invalid skill name: ${s}` }, { status: 400 })
        }
      }
    }

    // Create vigil.yml with minimal skeleton if it doesn't exist
    if (!existsSync(VIGIL_YML)) {
      writeFileSync(VIGIL_YML, 'chains:\n', 'utf-8')
    }

    const raw = readFileSync(VIGIL_YML, 'utf-8')
    const updated = upsertChain(raw, chain)
    writeFileSync(VIGIL_YML, updated, 'utf-8')

    return NextResponse.json({ ok: true, name: chain.name })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to save chain'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const name = body.name as string | undefined

    if (!name || !CHAIN_NAME_RE.test(name)) {
      return NextResponse.json({ error: 'Invalid chain name' }, { status: 400 })
    }
    if (!existsSync(VIGIL_YML)) {
      return NextResponse.json({ error: 'vigil.yml not found' }, { status: 404 })
    }

    const raw = readFileSync(VIGIL_YML, 'utf-8')
    const updated = removeChain(raw, name)
    writeFileSync(VIGIL_YML, updated, 'utf-8')

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete chain'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
