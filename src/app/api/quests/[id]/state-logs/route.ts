import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload.config'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams

    if (!id) {
      return NextResponse.json({ error: 'Quest ID is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Check if the quest exists
    try {
      await payload.findByID({
        collection: 'quests',
        id,
      })
    } catch (error) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    // Fetch all state logs for this quest
    const stateLogs = await payload.find({
      collection: 'quest-state-logs',
      where: {
        questId: {
          equals: id,
        },
      },
      sort: '-timestamp', // Sort by timestamp, newest first
    })

    return NextResponse.json(stateLogs)
  } catch (error) {
    console.error('Error fetching state logs:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch state logs',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
