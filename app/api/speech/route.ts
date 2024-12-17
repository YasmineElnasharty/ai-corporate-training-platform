import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
    try {
        const { text }: { text: string } = await request.json()

        const mp3 = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'nova',
            input: text,
        })

        const buffer = Buffer.from(await mp3.arrayBuffer())

        return new Response(buffer, {
            headers: {
                'Content-Type': 'audio/mpeg'
            }
        })
    } catch (error) {
        console.error('Speech synthesis error:', error)
        return NextResponse.json(
            { error: 'Error generating speech' },
            { status: 500 }
        )
    }
}

