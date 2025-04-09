import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload.config'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Fetch all quest users
    const users = await payload.find({
      collection: 'quest-users',
      sort: 'name', // Sort alphabetically by name
    })
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching quest users:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch quest users', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
