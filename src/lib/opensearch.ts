export async function createIndex(indexName: string, dimension: number) {
  const response = await fetch('/api/opensearch/index', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ indexName, dimension }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Index creation failed');
  }
  return response.json();
}

export async function deleteIndex(indexName: string) {
  const response = await fetch('/api/opensearch/index', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ indexName }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Index deletion failed');
  }
  return response.json();
}

export async function bulkIndex(
  indexName: string,
  documents: { id: string; content: string; embedding: number[] }[]
) {
  const response = await fetch('/api/opensearch/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ indexName, documents }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Bulk indexing failed');
  }
  return response.json();
}

export async function knnSearch(
  indexName: string,
  vector: number[],
  k: number = 5
) {
  const response = await fetch('/api/opensearch/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ indexName, vector, k }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'KNN search failed');
  }
  return response.json();
}

export async function keywordSearch(
  indexName: string,
  query: string,
  size: number = 5
) {
  const response = await fetch('/api/opensearch/keyword', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ indexName, query, size }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Keyword search failed');
  }
  return response.json();
}

export async function hybridSearch(
  indexName: string,
  vector: number[],
  query: string,
  k: number = 5,
  vectorWeight: number = 0.7,
  textWeight: number = 0.3
) {
  const response = await fetch('/api/opensearch/hybrid', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ indexName, vector, query, k, vectorWeight, textWeight }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Hybrid search failed');
  }
  return response.json();
}
