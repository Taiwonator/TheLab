import { getPayload } from 'payload';
import { NextResponse } from 'next/server';
import config from '@/payload.config';

export async function GET() {
  try {
    const payload = await getPayload({ config });

    // Fetch all user types
    const userTypesResponse = await payload.find({
      collection: 'mock-page-users',
      limit: 100,
    });

    return NextResponse.json({
      userTypes: userTypesResponse.docs,
    });
  } catch (error) {
    console.error('Error fetching user types:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user types',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
