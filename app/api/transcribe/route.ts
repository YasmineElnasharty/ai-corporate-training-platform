import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const audio = formData.get('audio') as Blob;

        if (!audio) {
            return NextResponse.json(
                { error: 'No audio file provided.' },
                { status: 400 }
            );
        }

        // Convert Blob to Buffer
        const arrayBuffer = await audio.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Use /tmp directory directly (no mkdir)
        const tempFilePath = join('/tmp', `audio-${Date.now()}.wav`);
        writeFileSync(tempFilePath, buffer);

        // Transcribe the audio file using OpenAI
        const response = await openai.audio.transcriptions.create({
            file: await import('fs').then((fs) => fs.createReadStream(tempFilePath)),
            model: 'whisper-1',
        });

        // Clean up the temporary file
        unlinkSync(tempFilePath);

        return NextResponse.json({ text: response.text });
    } catch (error: unknown) {
        console.error('Transcription error:', error);

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message || 'Error processing audio.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Unknown error occurred during transcription.' },
            { status: 500 }
        );
    }
}
