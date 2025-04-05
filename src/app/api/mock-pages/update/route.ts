import { getPayload } from 'payload';
import { NextRequest, NextResponse } from 'next/server';
import config from '@/payload.config';

export async function POST(req: NextRequest) {
  try {
    const { id, name } = await req.json();

    if (!id || !name) {
      return NextResponse.json(
        { error: 'ID and name are required' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Check if the mock page exists
    try {
      await payload.findByID({
        collection: 'mock-pages',
        id,
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Mock page not found' },
        { status: 404 }
      );
    }

    // Update the mock page
    const updatedPage = await payload.update({
      collection: 'mock-pages',
      id,
      data: {
        name,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Mock page updated successfully',
      page: updatedPage,
    });
  } catch (error) {
    console.error('Error updating mock page:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update mock page', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
