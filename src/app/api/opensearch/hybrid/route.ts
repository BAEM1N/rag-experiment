import { NextRequest, NextResponse } from 'next/server';

const OPENSEARCH_URL = process.env.OPENSEARCH_URL;
if (!OPENSEARCH_URL) throw new Error('OPENSEARCH_URL 환경변수가 설정되지 않았습니다');

export async function POST(request: NextRequest) {
  try {
    const { indexName, vector, query: searchQuery, k, vectorWeight, textWeight } = await request.json();

    if (!indexName || !/^[a-z0-9][a-z0-9_\-]*$/.test(indexName)) {
      return NextResponse.json({ error: 'Invalid index name' }, { status: 400 });
    }

    // Use bool query with should clauses combining KNN and match
    // with function_score to apply weights
    const query = {
      size: k || 5,
      query: {
        bool: {
          should: [
            {
              script_score: {
                query: { match_all: {} },
                script: {
                  source: `${vectorWeight || 0.7} * (1.0 / (1.0 + l2Squared(params.query_vector, doc['embedding'])))`,
                  params: {
                    query_vector: vector,
                  },
                },
              },
            },
            {
              match: {
                content: {
                  query: searchQuery,
                  boost: textWeight || 0.3,
                },
              },
            },
          ],
        },
      },
      highlight: {
        fields: {
          content: {
            pre_tags: ['<mark>'],
            post_tags: ['</mark>'],
            fragment_size: 200,
            number_of_fragments: 3,
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
        { error: data.error?.reason || 'Hybrid search failed' },
        { status: 400 }
      );
    }

    const results = data.hits.hits.map(
      (hit: { _id: string; _source: { content: string }; _score: number; highlight?: { content?: string[] } }) => ({
        id: hit._id,
        content: hit._source.content,
        score: hit._score,
        highlight: hit.highlight?.content || [],
      })
    );

    return NextResponse.json({ results, query });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
