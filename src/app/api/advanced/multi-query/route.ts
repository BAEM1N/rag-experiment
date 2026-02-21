import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 401 });
    }

    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `당신은 정보 검색 전문가입니다.
사용자의 질문을 다양한 관점에서 재구성하여 검색 효과를 높이는 것이 목표입니다.
원래 질문의 의도를 유지하면서, 서로 다른 키워드와 표현을 사용한 4개의 변형 질의를 생성해주세요.

반드시 아래 JSON 형식으로만 응답하세요:
["변형 질의 1", "변형 질의 2", "변형 질의 3", "변형 질의 4"]`,
          },
          {
            role: 'user',
            content: query,
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error?.message || 'OpenAI API error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '[]';

    let queries: string[];
    try {
      queries = JSON.parse(content);
    } catch {
      // Try to extract JSON array from the response
      const match = content.match(/\[[\s\S]*\]/);
      queries = match ? JSON.parse(match[0]) : [content];
    }

    return NextResponse.json({ queries });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Multi-query generation failed' },
      { status: 500 }
    );
  }
}
