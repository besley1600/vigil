import { NextResponse } from 'next/server'

export async function GET() {
  const defaultRepo = process.env.GITHUB_REPO || ''
  const extras = (process.env.GITHUB_REPOS || '')
    .split(',')
    .map(r => r.trim())
    .filter(Boolean)
  const repos = Array.from(new Set([defaultRepo, ...extras].filter(Boolean)))
  return NextResponse.json({ repos, default: defaultRepo })
}
