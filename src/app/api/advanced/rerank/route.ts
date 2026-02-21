import { NextRequest, NextResponse } from 'next/server';

interface RerankItem {
  content: string;
  source: 'retrieval' | 'sql';
  originalRank: number;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 401 });
    }

    const { query, results } = await request.json() as {
      query: string;
      results: RerankItem[];
    };
    if (!query || !results?.length) {
      return NextResponse.json({ error: 'Query and results are required' }, { status: 400 });
    }

    const resultsText = results
      .map((r, i) => `[${i + 1}] (${r.source === 'sql' ? 'SQL 결과' : '문서 검색'}) ${r.content}`)
      .join('\n\n');

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
            content: `당신은 정보 검색 결과의 관련성을 평가하는 전문가입니다.
사용자의 질문에 대해, 주어진 검색 결과들의 관련성을 평가하고 재순위화하세요.

반드시 아래 JSON 형식으로만 응답하세요:
[
  {"index": 원래_번호, "relevanceScore": 0.0~1.0, "reason": "관련성 판단 이유 (한국어, 1문장)"},
  ...
]

규칙:
- 질문에 직접 답할 수 있는 정보가 포함된 결과를 높게 평가
- SQL 데이터(정량)와 문서(정성) 모두 균형있게 평가
- relevanceScore는 0.0(무관) ~ 1.0(매우 관련) 사이 값
- 모든 결과에 대해 평가하되, 관련성 순서로 정렬하여 출력`,
          },
          {
            role: 'user',
            content: `질문: ${query}\n\n검색 결과:\n${resultsText}`,
          },
        ],
        temperature: 0,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error?.message || 'Reranking failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '[]';

    let rankings: { index: number; relevanceScore: number; reason: string }[];
    try {
      rankings = JSON.parse(content);
    } catch {
      const match = content.match(/\[[\s\S]*\]/);
      rankings = match ? JSON.parse(match[0]) : [];
    }

    // Build reranked results
    const reranked = rankings.map((rank, newIdx) => {
      const originalItem = results[rank.index - 1];
      return {
        content: originalItem?.content || '',
        source: originalItem?.source || 'retrieval',
        originalRank: rank.index,
        newRank: newIdx + 1,
        relevanceScore: rank.relevanceScore,
        reason: rank.reason,
      };
    });

    return NextResponse.json({ reranked });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Reranking failed' },
      { status: 500 }
    );
  }
}
