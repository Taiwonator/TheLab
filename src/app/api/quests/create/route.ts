import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload.config'

export async function POST(req: NextRequest) {
  try {
    const { productId, userId, overview, media } = await req.json()

    if (!productId || !userId || !overview) {
      return NextResponse.json(
        { error: 'Product ID, User ID, and Overview are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Validate that the product and user exist
    try {
      await payload.findByID({
        collection: 'quest-products',
        id: productId,
      })
    } catch (error) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    try {
      await payload.findByID({
        collection: 'quest-users',
        id: userId,
      })
    } catch (error) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create a new quest
    const newQuest = await payload.create({
      collection: 'quests',
      data: {
        productId,
        userId,
        overview,
        AILabels: {
          source: '',
          type: '',
          system: '',
          outcome: '',
        },
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        media: media || undefined,
      },
    })

    // Create a quest state log entry
    await payload.create({
      collection: 'quest-state-logs',
      data: {
        questId: newQuest.id,
        timestamp: new Date().toISOString(),
        state: 'created',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Quest created successfully',
      quest: newQuest,
    })
  } catch (error) {
    console.error('Error creating quest:', error)
    return NextResponse.json(
      {
        error: 'Failed to create quest',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
