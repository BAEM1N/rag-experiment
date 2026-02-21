import { NextRequest, NextResponse } from 'next/server';

const OPENSEARCH_URL = process.env.OPENSEARCH_URL;
if (!OPENSEARCH_URL) throw new Error('OPENSEARCH_URL 환경변수가 설정되지 않았습니다');

export async function POST(request: NextRequest) {
  try {
    const { indexName, vector, k } = await request.json();

    if (!indexName || !/^[a-z0-9][a-z0-9_\-]*$/.test(indexName)) {
      return NextResponse.json({ error: 'Invalid index name' }, { status: 400 });
    }

    const query = {
      size: k || 5,
      query: {
        knn: {
          embedding: {
            vector,
            k: k || 5,
          },
        },
      },
    };

    const response = await fetch(`${OPENSEARCH_URL}/${indexName}/_search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.reason || 'Search failed' },
        { status: 400 }
      );
    }

    const results = data.hits.hits.map((hit: { _id: string; _source: { content: string }; _score: number }) => ({
      id: hit._id,
      content: hit._source.content,
      score: hit._score,
    }));

    return NextResponse.json({ results, query });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
