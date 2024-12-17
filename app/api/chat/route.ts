import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
    try {
        const { message, skillPrompt }: { message: string; skillPrompt?: string } = await request.json()

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: skillPrompt || 'You are a helpful AI assistant.'
                },
                {
                    role: 'user',
                    content: message
                }
            ]
        })

        return NextResponse.json({
            message: completion.choices[0].message.content
        })
    } catch (error) {
        console.error('Chat error:', error)
        return NextResponse.json(
            { error: 'Error processing chat' },
            { status: 500 }
        )
    }
}

