import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFileSync, unlinkSync, createReadStream } from 'fs';
import { join } from 'path';

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
        // Parse form data and extract audio file
        const formData = await request.formData();
        const audio = formData.get('audio') as Blob;

        if (!audio) {
            return NextResponse.json(
                { error: 'No audio file provided.' },
                { status: 400 }
            );
        }

        // Convert Blob to Buffer and save to temporary file
        const arrayBuffer = await audio.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const tempFilePath = join('/tmp', `audio-${Date.now()}.wav`);
        writeFileSync(tempFilePath, buffer);

        try {
            // Send file to OpenAI for transcription
            const response = await openai.audio.transcriptions.create({
                file: createReadStream(tempFilePath),
                model: 'whisper-1',
            });

            unlinkSync(tempFilePath); // Clean up temporary file

            return NextResponse.json({ text: response.text });
        } catch (apiError) {
            unlinkSync(tempFilePath); // Ensure cleanup
            console.error('OpenAI API Error:', apiError);

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
