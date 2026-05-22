import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) return NextResponse.json({ error: 'GitHub OAuth not configured' }, { status: 503 })
  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'repo workflow',
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/auth/github/callback`,
  })
  return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`)
}
