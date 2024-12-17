import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFileSync, unlinkSync, createReadStream } from 'fs';
import { join } from 'path';

// Initialize OpenAI client safely
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
        const formData = await request.formData();
        const audio = formData.get('audio') as Blob;

        // Check if audio file exists
        if (!audio) {
            console.warn('No audio file provided.');
            return NextResponse.json(
                { error: 'No audio file provided.' },
                { status: 400 }
            );
        }

        // Convert Blob to Buffer
        const arrayBuffer = await audio.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Create a temporary file in the /tmp directory
        const tempFilePath = join('/tmp', `audio-${Date.now()}.wav`);
        writeFileSync(tempFilePath, buffer);

        try {
            // Send file to OpenAI for transcription
            const response = await openai.audio.transcriptions.create({
                file: createReadStream(tempFilePath),
                model: 'whisper-1',
            });

            // Clean up the temporary file
            unlinkSync(tempFilePath);

            // Return transcribed text
            return NextResponse.json({ text: response.text });
        } catch (apiError) {
            console.error('OpenAI API Error:', apiError);

            // Clean up temporary file on failure
            unlinkSync(tempFilePath);

            return NextResponse.json(
                { error: 'Failed to process the audio transcription.' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error processing audio request:', error);
        return NextResponse.json(
            { error: 'Error processing the audio file.' },
            { status: 500 }
        );
    }
}
