import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload.config'

export async function POST(req: NextRequest) {
  try {
    const { id, blocks } = await req.json()

    if (!id || !blocks || !Array.isArray(blocks)) {
      return NextResponse.json(
        { error: 'Invalid request. ID and blocks array are required.' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Fetch the current mock page to verify it exists
    const existingPage = await payload.findByID({
      collection: 'mock-pages',
      id,
    })

    if (!existingPage) {
      return NextResponse.json({ error: 'Mock page not found' }, { status: 404 })
    }

    // Update the mock page with the new blocks order
    const updatedPage = await payload.update({
      collection: 'mock-pages',
      id,
      data: {
        blocks,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Blocks order updated successfully',
      page: updatedPage,
    })
  } catch (error) {
    console.error('Error updating blocks order:', error)
    return NextResponse.json(
      {
        error: 'Failed to update blocks order',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
