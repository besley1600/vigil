import { NextResponse } from 'next/server'
import { getFileContent, getDirectory } from '@/lib/github'

export async function GET(request: Request) {
  const token = request.headers.get('x-github-token') || ''
  const repo = request.headers.get('x-github-repo') || ''

  let vigilyml = false
  let skillCount = 0
  let apiError = ''

  if (token && repo) {
    try {
      await getFileContent('vigil.yml', request)
      vigilyml = true
      const dirs = await getDirectory('skills', request)
      skillCount = dirs.filter(d => d.type === 'dir').length
    } catch (e) {
      apiError = e instanceof Error ? e.message : String(e)
    }
  }

  return NextResponse.json({ hasToken: !!token, repo, vigilyml, skillCount, apiError })
}
