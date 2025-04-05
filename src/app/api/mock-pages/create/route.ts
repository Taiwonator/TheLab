import { getPayload } from 'payload';
import { NextRequest, NextResponse } from 'next/server';
import config from '@/payload.config';

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Create a new mock page
    const newPage = await payload.create({
      collection: 'mock-pages',
      data: {
        name,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Mock page created successfully',
      page: newPage,
    });
  } catch (error) {
    console.error('Error creating mock page:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create mock page', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
