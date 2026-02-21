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
            content: `당신은 삼성SDS에 대한 문서를 작성하는 전문가입니다.
사용자의 질문에 대해, 실제로 관련 문서에 있을 법한 내용으로 가상의 답변 문서를 작성해주세요.
이 가상 문서는 실제 문서 검색을 개선하기 위한 HyDE(Hypothetical Document Embeddings) 기법에 사용됩니다.
구체적인 수치나 사실을 포함하여 200-300자 분량으로 작성하세요.
가상 문서만 출력하고, 다른 설명은 포함하지 마세요.`,
          },
          {
            role: 'user',
            content: query,
          },
        ],
        temperature: 0.7,
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
    const hydeDocument = data.choices[0]?.message?.content || '';

    return NextResponse.json({ hydeDocument });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'HyDE generation failed' },
      { status: 500 }
    );
  }
}
