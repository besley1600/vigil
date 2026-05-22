import { NextResponse } from 'next/server'
import { getFileContent, getDirectory } from '@/lib/github'

export async function GET(request: Request) {
  const hasToken = !!process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO || ''

  let vigilyml = false
  let skillCount = 0
  let apiError = ''

  if (hasToken && repo) {
    try {
      await getFileContent('vigil.yml', request)
      vigilyml = true
      const dirs = await getDirectory('skills', request)
      skillCount = dirs.filter(d => d.type === 'dir').length
    } catch (e) {
      apiError = e instanceof Error ? e.message : String(e)
    }
  }

  return NextResponse.json({ hasToken, repo, vigilyml, skillCount, apiError })
}
