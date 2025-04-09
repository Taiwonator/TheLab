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
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    // Fetch the quest user
    const user = await payload.findByID({
      collection: 'quest-users',
      id,
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching quest user:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch quest user', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
