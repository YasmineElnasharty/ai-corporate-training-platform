import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '', // Ensure fallback for missing API key
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const audio = formData.get('audio') as Blob;

        if (!audio) {
            return NextResponse.json(
                { error: 'No audio file provided' },
                { status: 400 }
            );
        }

        // Convert Blob to Buffer
        const arrayBuffer = await audio.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Ensure the tmp directory exists
        const tempDir = join(process.cwd(), 'tmp'); // Cross-platform temp directory
        if (!existsSync(tempDir)) {
            mkdirSync(tempDir); // Create the directory if it doesn't exist
        }

        // Create a temporary file path
        const tempFilePath = join(tempDir, `audio-${Date.now()}.wav`);
        writeFileSync(tempFilePath, buffer);

        // Transcribe the audio file using OpenAI
        const response = await openai.audio.transcriptions.create({
            file: await import('fs').then((fs) => fs.createReadStream(tempFilePath)),
            model: 'whisper-1',
        });

        // Clean up the temporary file
        unlinkSync(tempFilePath);

        // Return the transcription result
        return NextResponse.json({ text: response.text });
    } catch (error: unknown) {
        console.error('Transcription error:', error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message || 'Error processing audio' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Unknown error occurred during transcription.' },
            { status: 500 }
        );
    }
}
