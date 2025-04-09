import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload.config'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Quest ID is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Fetch the quest with populated relationships
    const quest = await payload.findByID({
      collection: 'quests',
      id,
      depth: 1, // Populate first-level relationships
    })

    // Fetch the latest state log for this quest
    const stateLogs = await payload.find({
      collection: 'quest-state-logs',
      where: {
        questId: {
          equals: id,
        },
      },
      sort: '-timestamp', // Sort by timestamp, newest first
      limit: 1,
    })

    // Add the latest state to the quest
    const questWithState = {
      ...quest,
      latestState: stateLogs.docs.length > 0 ? stateLogs.docs[0].state : null,
    }

    return NextResponse.json(questWithState)
  } catch (error) {
    console.error('Error fetching quest:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch quest',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { overview } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Quest ID is required' }, { status: 400 })
    }

    if (!overview) {
      return NextResponse.json({ error: 'Overview is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Check if the quest exists
    let quest
    try {
      quest = await payload.findByID({
        collection: 'quests',
        id,
      })
    } catch (error) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    // Fetch the latest state log for this quest
    const stateLogs = await payload.find({
      collection: 'quest-state-logs',
      where: {
        questId: {
          equals: id,
        },
      },
      sort: '-timestamp', // Sort by timestamp, newest first
      limit: 1,
    })

    // Check if the quest is in the 'created' state
    const latestState = stateLogs.docs.length > 0 ? stateLogs.docs[0].state : null
    if (latestState !== 'created') {
      return NextResponse.json(
        { error: 'Quest can only be edited in the created state' },
        { status: 403 },
      )
    }

    // Update the quest
    const updatedQuest = await payload.update({
      collection: 'quests',
      id,
      data: {
        overview,
        dateModified: new Date(),
      },
    })

    // Return the updated quest with the latest state
    const questWithState = {
      ...updatedQuest,
      latestState,
    }

    return NextResponse.json(questWithState)
  } catch (error) {
    console.error('Error updating quest:', error)
    return NextResponse.json(
      {
        error: 'Failed to update quest',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
