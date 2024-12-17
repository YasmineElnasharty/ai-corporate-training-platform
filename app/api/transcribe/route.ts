import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { writeFileSync } from 'fs'
import { join } from 'path'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const audio = formData.get('audio') as Blob

        if (!audio) {
            return NextResponse.json(
                { error: 'No audio file provided' },
                { status: 400 }
            )
        }

        // Convert Blob to Buffer
        const arrayBuffer = await audio.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Create a temporary file
        const tempFilePath = join('/tmp', `audio-${Date.now()}.wav`)
        writeFileSync(tempFilePath, buffer)

        const response = await openai.audio.transcriptions.create({
            file: await import('fs').then(fs =>
                fs.createReadStream(tempFilePath)
            ),
            model: 'whisper-1',
        })

        // Clean up the temporary file
        await import('fs').then(fs =>
            fs.unlinkSync(tempFilePath)
        )

        return NextResponse.json({ text: response.text })
    } catch (error) {
        console.error('Transcription error:', error)
        return NextResponse.json(
            { error: 'Error processing audio' },
            { status: 500 }
        )
    }
}
