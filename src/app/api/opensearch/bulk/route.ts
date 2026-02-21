import { NextRequest, NextResponse } from 'next/server';

const OPENSEARCH_URL = process.env.OPENSEARCH_URL;
if (!OPENSEARCH_URL) throw new Error('OPENSEARCH_URL 환경변수가 설정되지 않았습니다');

export async function POST(request: NextRequest) {
  try {
    const { indexName, documents } = await request.json();

    if (!indexName || !/^[a-z0-9][a-z0-9_\-]*$/.test(indexName)) {
      return NextResponse.json({ error: 'Invalid index name' }, { status: 400 });
    }

    let bulkBody = '';
    for (const doc of documents) {
      bulkBody += JSON.stringify({ index: { _index: indexName, _id: doc.id } }) + '\n';
      bulkBody += JSON.stringify({
        content: doc.content,
        embedding: doc.embedding,
        chunk_id: doc.id,
        chunk_index: doc.index ?? 0,
      }) + '\n';
    }

    const response = await fetch(`${OPENSEARCH_URL}/_bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-ndjson' },
      body: bulkBody,
    });

    const data = await response.json();
    if (data.errors) {
      const firstError = data.items?.find((item: Record<string, { error?: unknown }>) =>
        Object.values(item).some((v) => v.error)
      );
      return NextResponse.json(
        { error: 'Bulk indexing had errors', details: firstError },
        { status: 400 }
      );
    }

    // Refresh index
    await fetch(`${OPENSEARCH_URL}/${indexName}/_refresh`, { method: 'POST' });

    return NextResponse.json({ success: true, indexed: documents.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
