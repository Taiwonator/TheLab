import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload.config'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Quest ID is required' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    // Fetch the quest with populated relationships
    const quest = await payload.findByID({
      collection: 'quests',
      id,
      depth: 1, // Populate first-level relationships
    })

    return NextResponse.json(quest)
  } catch (error) {
    console.error('Error fetching quest:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch quest', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
