import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload.config'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Fetch the quest product
    const product = await payload.findByID({
      collection: 'quest-products',
      id,
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching quest product:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch quest product',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
