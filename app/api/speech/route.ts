// speech/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Ensure Node.js runtime instead of edge if needed

export async function POST() {
  return NextResponse.json({ message: 'Test response' });
}
