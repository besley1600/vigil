import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  const clientId = process.env.GITHUB_CLIENT_ID!
  const clientSecret = process.env.GITHUB_CLIENT_SECRET!

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  })
  const tokenData = await tokenRes.json()
  const token = tokenData.access_token as string

  const reposRes = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50&type=owner', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  })
  const reposData = await reposRes.json()
  const repos: string[] = (Array.isArray(reposData) ? reposData : [])
    .slice(0, 20)
    .map((r: { full_name: string }) => r.full_name)

  const redirectUrl = `/app?gh_token=${encodeURIComponent(token)}&gh_repos=${encodeURIComponent(repos.join(','))}`
  return NextResponse.redirect(new URL(redirectUrl, request.url))
}
