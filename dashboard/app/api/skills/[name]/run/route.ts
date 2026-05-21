import { NextResponse } from 'next/server'
import { execFileSync } from 'child_process'
import { resolve } from 'path'
import { triggerWorkflow } from '@/lib/github'

const REPO_ROOT = resolve(process.cwd(), '..')

function isRemote() {
  return !!(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params

    if (!/^[a-z][a-z0-9-]*$/.test(name)) {
      return NextResponse.json({ error: 'Invalid skill name' }, { status: 400 })
    }

    let skillVar = ''
    let model = ''
    try {
      const body = await request.json()
      if (body.var && typeof body.var === 'string') {
        skillVar = body.var.replace(/[^a-zA-Z0-9_ .\-/#@]/g, '')
      }
      if (body.model && typeof body.model === 'string') {
        model = body.model.replace(/[^a-zA-Z0-9_\-]/g, '')
      }
    } catch { /* no body is fine */ }

    if (isRemote()) {
      const extraInputs: Record<string, string> = {}
      if (skillVar) extraInputs.var = skillVar
      if (model) extraInputs.model = model
      await triggerWorkflow(name, extraInputs)
      return NextResponse.json({ ok: true })
    }

    // Local: use gh CLI
    const args = ['workflow', 'run', 'vigil.yml', '-f', `skill=${name}`]
    if (skillVar) args.push('-f', `var=${skillVar}`)
    if (model) args.push('-f', `model=${model}`)
    execFileSync('gh', args, { stdio: 'pipe', cwd: REPO_ROOT })

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to trigger run'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
