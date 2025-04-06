import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload.config'

type Params = Promise<{ id: string }>

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params

  try {
    const body = await req.json()
    const { blockId } = body

    if (!blockId) {
      return NextResponse.json({ error: 'Block ID is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Get the current mock page
    const mockPage = await payload.findByID({ collection: 'mock-pages', id })

    if (!mockPage || !mockPage.blocks) {
      return NextResponse.json({ error: 'Mock page not found or has no blocks' }, { status: 404 })
    }

    // Find the block to delete
    const blocks = mockPage.blocks
    const blockIndex = blocks.findIndex((block: any) => block.id === blockId)

    if (blockIndex === -1) {
      return NextResponse.json({ error: 'Block not found in this mock page' }, { status: 404 })
    }

    // Remove the block
    const updatedBlocks = [...blocks]
    updatedBlocks.splice(blockIndex, 1)

    // Update the mock page with the updated blocks
    const updatedPage = await payload.update({
      collection: 'mock-pages',
      id,
      data: {
        blocks: updatedBlocks,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Block deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting block:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete block',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
