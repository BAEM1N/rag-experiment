import { NextRequest, NextResponse } from 'next/server';

const OPENSEARCH_URL = process.env.OPENSEARCH_URL;
if (!OPENSEARCH_URL) throw new Error('OPENSEARCH_URL 환경변수가 설정되지 않았습니다');

export async function POST(request: NextRequest) {
  try {
    const { indexName, dimension } = await request.json();

    if (!indexName || !/^[a-z0-9][a-z0-9_\-]*$/.test(indexName)) {
      return NextResponse.json({ error: 'Invalid index name' }, { status: 400 });
    }

    // Delete existing index if it exists
    await fetch(`${OPENSEARCH_URL}/${indexName}`, { method: 'DELETE' }).catch(() => {});

    const body = {
      settings: {
        index: {
          knn: true,
          'knn.algo_param.ef_search': 100,
        },
      },
      mappings: {
        properties: {
          content: {
            type: 'text',
            analyzer: 'standard',
          },
          embedding: {
            type: 'knn_vector',
            dimension: dimension || 1024,
            method: {
              name: 'hnsw',
              space_type: 'l2',
              engine: 'lucene',
              parameters: {
                ef_construction: 128,
                m: 24,
              },
            },
          },
          chunk_id: {
            type: 'keyword',
          },
          chunk_index: {
            type: 'integer',
          },
        },
      },
    };

    const response = await fetch(`${OPENSEARCH_URL}/${indexName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error?.reason || 'Index creation failed' }, { status: 400 });
    }

    return NextResponse.json({ success: true, index: indexName });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { indexName } = await request.json();

    if (!indexName || !/^[a-z0-9][a-z0-9_\-]*$/.test(indexName)) {
      return NextResponse.json({ error: 'Invalid index name' }, { status: 400 });
    }

    const response = await fetch(`${OPENSEARCH_URL}/${indexName}`, {
      method: 'DELETE',
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
