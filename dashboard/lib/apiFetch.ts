export function getGitHubHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('gh_token') || ''
  const repo = localStorage.getItem('gh_repo') || ''
  const headers: Record<string, string> = {}
  if (token) headers['x-github-token'] = token
  if (repo) headers['x-github-repo'] = repo
  return headers
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getGitHubHeaders(),
      ...(options.headers as Record<string, string> || {}),
    },
  })
}
