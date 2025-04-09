import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload.config'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Fetch all quest products
    const products = await payload.find({
      collection: 'quest-products',
      sort: 'name', // Sort alphabetically by name
    })
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching quest products:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch quest products', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
