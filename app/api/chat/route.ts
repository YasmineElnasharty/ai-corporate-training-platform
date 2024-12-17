import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // Safely retrieve the API key
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.warn('OPENAI_API_KEY is missing. API call skipped.');
        return NextResponse.json(
            { error: 'API key is missing. Please configure OPENAI_API_KEY.' },
            { status: 500 }
        );
    }

    try {
        // Parse the incoming request to get the user message
        const { message } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Valid message content is required.' },
                { status: 400 }
            );
        }

        // Set a timeout for the OpenAI API call to prevent hanging requests
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10-second timeout

        // Call the OpenAI API
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
            signal: controller.signal,
        });

        clearTimeout(timeout); // Clear timeout once the API call completes

        // Handle OpenAI API errors
        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API Error:', errorData);
            return NextResponse.json(
                { error: errorData.error?.message || 'Failed to fetch response from OpenAI API.' },
                { status: response.status }
            );
        }

        // Extract and return the response
        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content;

        if (!aiResponse) {
            console.error('No response content returned from OpenAI.');
            return NextResponse.json(
                { error: 'No response content from OpenAI.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: aiResponse });
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error('Request to OpenAI API timed out.');
            return NextResponse.json(
                { error: 'The request to OpenAI API timed out. Please try again later.' },
                { status: 504 }
            );
        }

        console.error('Error calling OpenAI API:', error);
        return NextResponse.json(
            { error: 'Internal server error. Please try again later.' },
            { status: 500 }
        );
    }
}
