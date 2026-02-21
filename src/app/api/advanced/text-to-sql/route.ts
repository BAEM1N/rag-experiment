import { NextRequest, NextResponse } from 'next/server';
import { SQL_TABLE_DESCRIPTIONS } from '@/lib/sample-data';

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

    // Step 1: Generate SQL from natural language
    const sqlGenResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `당신은 SQL 전문가입니다. 아래 데이터베이스 스키마를 참고하여 사용자의 질문을 SQLite SQL 쿼리로 변환하세요.

${SQL_TABLE_DESCRIPTIONS}

규칙:
- SQLite 문법을 사용하세요.
- SELECT 쿼리만 생성하세요 (INSERT, UPDATE, DELETE 불가).
- 가능한 경우 JOIN을 활용하세요.
- 한국어 컬럼값(예: 'IT서비스', '물류')을 정확히 사용하세요.
- SQL 쿼리만 출력하고, 다른 설명은 포함하지 마세요.
- 코드 블록(\`\`\`)은 사용하지 마세요.`,
          },
          {
            role: 'user',
            content: query,
          },
        ],
        temperature: 0,
        max_tokens: 300,
      }),
    });

    if (!sqlGenResponse.ok) {
      const error = await sqlGenResponse.json();
      return NextResponse.json(
        { error: error.error?.message || 'SQL generation failed' },
        { status: sqlGenResponse.status }
      );
    }

    const sqlGenData = await sqlGenResponse.json();
    let generatedSql = sqlGenData.choices[0]?.message?.content?.trim() || '';

    // Clean up potential code block markers
    generatedSql = generatedSql.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim();

    // LLM 생성 SQL 검증 — SELECT만 허용 (프롬프트 인젝션 방지)
    const sqlUpper = generatedSql.toUpperCase().trim();
    const FORBIDDEN_SQL = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE', 'TRUNCATE', 'REPLACE', 'ATTACH', 'DETACH'];
    if (!sqlUpper.startsWith('SELECT') || FORBIDDEN_SQL.some((kw) => sqlUpper.includes(kw + ' '))) {
      return NextResponse.json(
        { error: 'LLM이 SELECT가 아닌 SQL을 생성했습니다. 거부됨.', generatedSql },
        { status: 400 }
      );
    }

    // Step 2: Execute SQL on the in-memory DB
    const execResponse = await fetch(new URL('/api/advanced/setup-sql', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'query', query: generatedSql }),
    });

    if (!execResponse.ok) {
      const error = await execResponse.json();
      return NextResponse.json(
        { error: `SQL 실행 오류: ${error.error}`, generatedSql },
        { status: 400 }
      );
    }

    const execData = await execResponse.json();

    // Step 3: Generate narrative from SQL results
    const narrativeResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `당신은 데이터 분석 전문가입니다. SQL 쿼리 결과를 자연어로 설명해주세요.
결과를 요약하고, 핵심 인사이트를 포함하여 2-3문장으로 서술하세요.`,
          },
          {
            role: 'user',
            content: `질문: ${query}\n\nSQL: ${generatedSql}\n\n결과: ${JSON.stringify(execData.rows)}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    let narrative = '';
    if (narrativeResponse.ok) {
      const narrativeData = await narrativeResponse.json();
      narrative = narrativeData.choices[0]?.message?.content || '';
    }

    return NextResponse.json({
      generatedSql,
      columns: execData.columns,
      rows: execData.rows,
      narrative,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Text-to-SQL failed' },
      { status: 500 }
    );
  }
}
