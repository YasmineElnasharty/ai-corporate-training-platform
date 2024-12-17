import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.warn('OPENAI_API_KEY is missing. API functionality is disabled.');
}

let openai: OpenAI | null = null;

// Safely initialize OpenAI only if API key exists
if (apiKey) {
    openai = new OpenAI({ apiKey });
}

export async function POST(request: Request) {
    if (!openai) {
        return NextResponse.json(
            { error: 'API key is missing. Please configure OPENAI_API_KEY.' },
            { status: 500 }
        );
    }

    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: 'Text input is required.' },
                { status: 400 }
            );
        }

        // Generate speech using OpenAI's text-to-speech API
        const response = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'alloy',
            input: text,
        });

        return new NextResponse(response.body as any, {
            headers: {
                'Content-Type': 'audio/mpeg',
            },
        });
    } catch (error) {
        console.error('Speech generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate speech.' },
            { status: 500 }
        );
    }
}
