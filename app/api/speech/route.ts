// app/api/speech/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is missing.');
    return NextResponse.json(
      { error: 'API key is missing. Please configure OPENAI_API_KEY.' },
      { status: 500 }
    );
  }

  try {
    // Parse JSON containing the text to convert to speech
    const { text }: { text: string } = await request.json();
    if (!text) {
      return NextResponse.json(
        { error: 'No text provided for speech synthesis.' },
        { status: 400 }
      );
    }

    // Use the OpenAI Audio Speech endpoint to generate an MP3 from the text
    const response = await openai.audio.speech.create({
      model: "tts-1",   // Use "tts-1" for low latency
      voice: "nova",   // Choose one of the available voices: alloy, echo, fable, onyx, nova, shimmer
      input: text
    });

    // Convert the response (ArrayBuffer) to a Node.js Buffer
    const buffer = Buffer.from(await response.arrayBuffer());

    // Return the MP3 audio as a binary response
    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('Error processing speech synthesis request:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech.' },
      { status: 500 }
    );
  }
}
