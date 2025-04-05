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

    // Create a new mock page user
    const newUser = await payload.create({
      collection: 'mock-page-users',
      data: {
        name,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Mock page user created successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Error creating mock page user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create mock page user', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
