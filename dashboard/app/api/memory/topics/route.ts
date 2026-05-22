import { NextResponse } from 'next/server'
import { listTopics } from '@/lib/memory'

export async function GET(request: Request) {
  try {
    const topics = await listTopics(request)
    return NextResponse.json({ count: topics.length, topics })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to list topics'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
