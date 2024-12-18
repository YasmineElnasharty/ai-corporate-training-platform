import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // Retrieve the API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.warn('OPENAI_API_KEY is missing. Skipping API call.');
        return NextResponse.json(
            { error: 'API key is missing. Please configure OPENAI_API_KEY.' },
            { status: 500 }
        );
    }

    try {
        // Parse the incoming request to get the message content
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Message content is required.' },
                { status: 400 }
            );
        }

        // Make the API request to OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [{ role: 'user', content: message }],
              max_tokens: 4000,
              temperature: 0.7
            })
          });
          

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API Error:', errorData);
            return NextResponse.json(
                { error: 'Failed to fetch response from OpenAI API.' },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Return the response content
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