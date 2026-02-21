import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key is required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { messages, model, temperature, maxTokens } = await request.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages,
        temperature: temperature ?? 0.3,
        max_tokens: maxTokens || 1000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(
        JSON.stringify({ error: error.error?.message || 'OpenAI API error' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
