import { NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Default voice ID - you can change this to your preferred voice

export async function POST(request: Request) {
  try {
    // Ensure the API key is available
    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'Missing ElevenLabs API key in environment variables.' },
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

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`ElevenLabs API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer();

    // Return the audio file as a response
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });

  } catch (error: unknown) {
    console.error('Speech synthesis error:', error);
    
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