import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload.config'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const { state, notes } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Quest ID is required' }, { status: 400 })
    }

    if (!state) {
      return NextResponse.json({ error: 'State is required' }, { status: 400 })
    }

    // Validate state
    const validStates = ['created', 'proposing', 'reviewing', 'approved', 'denied']
    if (!validStates.includes(state)) {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 })
    }

    // Require notes for approved or denied states
    if ((state === 'approved' || state === 'denied') && !notes) {
      return NextResponse.json(
        { error: 'Notes are required when approving or denying a quest' },
        { status: 400 },
      )
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

    const latestState = stateLogs.docs.length > 0 ? stateLogs.docs[0].state : null

    // Validate state transitions
    if (latestState === state) {
      return NextResponse.json({ error: `Quest is already in the ${state} state` }, { status: 400 })
    }

    // Validate state transitions
    if (latestState === 'approved' || latestState === 'denied') {
      return NextResponse.json(
        { error: 'Cannot change state of an approved or denied quest' },
        { status: 403 },
      )
    }

    // Validate transitions from created state
    if (latestState === 'created' && !['proposing', 'approved', 'denied'].includes(state)) {
      return NextResponse.json(
        {
          error: 'From created state, quest can only transition to proposing, approved, or denied',
        },
        { status: 400 },
      )
    }

    // Validate transitions from reviewing state
    if (latestState === 'reviewing' && !['proposing', 'approved', 'denied'].includes(state)) {
      return NextResponse.json(
        {
          error:
            'From reviewing state, quest can only transition to proposing, approved, or denied',
        },
        { status: 400 },
      )
    }

    // Validate transitions from proposing state
    if (latestState === 'proposing' && state !== 'reviewing') {
      return NextResponse.json(
        { error: 'From proposing state, quest can only transition to reviewing' },
        { status: 400 },
      )
    }

    // Create a new state log
    const newStateLog = await payload.create({
      collection: 'quest-state-logs',
      data: {
        questId: id,
        state,
        timestamp: new Date().toISOString(),
        notes: notes || undefined,
      },
    })

    // Update the quest's modified date
    await payload.update({
      collection: 'quests',
      id,
      data: {
        dateModified: new Date().toISOString(),
      },
    })

    // Return the updated quest with the latest state
    return NextResponse.json({
      success: true,
      message: `Quest state updated to ${state}`,
      stateLog: newStateLog,
    })
  } catch (error) {
    console.error('Error updating quest state:', error)
    return NextResponse.json(
      {
        error: 'Failed to update quest state',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
