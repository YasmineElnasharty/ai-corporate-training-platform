import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    // Ensure the API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Missing OpenAI API key in environment variables.' },
        { status: 500 }
      );
    }

    // Parse the input text from the request body
    const { text }: { text: string } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: Text is required.' },
        { status: 400 }
      );
    }

    // Generate speech using OpenAI
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: text,
    });

    // Convert the response to a buffer for streaming
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Return the audio file as a response
    const response = new Response(buffer, {
      headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': buffer.length.toString(),
      },
  });
  
  } catch (error: unknown) {
    console.error('Speech synthesis error:', error);

    // Type-safe error handling
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Error generating speech',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Unknown error occurred.' },
      { status: 500 }
    );
  }
}
