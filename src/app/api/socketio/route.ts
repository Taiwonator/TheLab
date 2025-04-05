import { NextResponse } from 'next/server';

// This is a simple endpoint that will be used to initialize the Socket.io connection
export async function GET() {
  return NextResponse.json({ message: 'Socket.io server is ready' });
}
