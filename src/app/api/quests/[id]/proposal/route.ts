import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload.config'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { proposal } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Quest ID is required' }, { status: 400 })
    }

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal is required' }, { status: 400 })
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

    // Check if the quest is in the 'proposing' state
    const latestState = stateLogs.docs.length > 0 ? stateLogs.docs[0].state : null
    if (latestState !== 'proposing') {
      let errorMessage = 'Quest must be in the proposing state to add or edit a proposal'

      if (latestState === 'reviewing') {
        errorMessage = 'This proposal is currently under review and cannot be edited'
      } else if (latestState === 'approved') {
        errorMessage = 'This proposal has been approved and cannot be edited'
      } else if (latestState === 'denied') {
        errorMessage = 'This proposal has been denied and cannot be edited'
      }

      return NextResponse.json({ error: errorMessage }, { status: 403 })
    }

    // Update the quest with the proposal
    const updatedQuest = await payload.update({
      collection: 'quests',
      id,
      data: {
        proposal,
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
    console.error('Error updating quest proposal:', error)
    return NextResponse.json(
      {
        error: 'Failed to update quest proposal',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
