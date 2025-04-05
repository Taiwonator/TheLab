import { getPayload } from 'payload';
import { NextRequest, NextResponse } from 'next/server';
import config from '@/payload.config';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { blockId, name, userTypes } = body;

    if (!blockId || !name) {
      return NextResponse.json(
        { error: 'Block ID and name are required' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Get the current mock page
    const mockPage = await payload.findByID({
      collection: 'mock-pages',
      id: params.id,
    });

    if (!mockPage || !mockPage.blocks) {
      return NextResponse.json(
        { error: 'Mock page not found or has no blocks' },
        { status: 404 }
      );
    }

    // Find the block to update
    const blocks = mockPage.blocks;
    const blockIndex = blocks.findIndex((block: any) => block.id === blockId);

    if (blockIndex === -1) {
      return NextResponse.json(
        { error: 'Block not found in this mock page' },
        { status: 404 }
      );
    }

    // Update the block
    const updatedBlocks = [...blocks];
    updatedBlocks[blockIndex] = {
      ...updatedBlocks[blockIndex],
      name,
      userTypes,
    };

    // Update the mock page with the updated blocks
    const updatedPage = await payload.update({
      collection: 'mock-pages',
      id: params.id,
      data: {
        blocks: updatedBlocks,
      },
    });

    // Get the updated block
    const updatedBlock = updatedPage.blocks[blockIndex];

    return NextResponse.json({
      success: true,
      message: 'Block updated successfully',
      block: updatedBlock,
    });
  } catch (error) {
    console.error('Error updating block:', error);
    return NextResponse.json(
      {
        error: 'Failed to update block',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
