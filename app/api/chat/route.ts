import { NextResponse } from 'next/server';

interface OpenAIResponse {
    choices?: { message?: { content: string } }[];
}

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
        const { message }: { message: string } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Message content is required.' },
                { status: 400 }
            );
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: message }],
            }),
        });

        const data: OpenAIResponse = await response.json();

        return NextResponse.json({
            message: data.choices?.[0]?.message?.content || 'No response from AI.',
        });
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return NextResponse.json(
            { error: 'Internal server error.' },
            { status: 500 }
        );
    }
}
