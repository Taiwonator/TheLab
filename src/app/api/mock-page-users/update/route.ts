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

    // Check if the mock page user exists
    try {
      await payload.findByID({
        collection: 'mock-page-users',
        id,
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Mock page user not found' },
        { status: 404 }
      );
    }

    // Update the mock page user
    const updatedUser = await payload.update({
      collection: 'mock-page-users',
      id,
      data: {
        name,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Mock page user updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating mock page user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update mock page user', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
