import { UMAP } from 'umap-js';

export function computeUMAP(
  embeddings: number[][],
  questionEmbedding?: number[]
): { points: [number, number][]; questionPoint?: [number, number] } {
  if (embeddings.length < 2) {
    return {
      points: embeddings.map(() => [Math.random() * 100, Math.random() * 100] as [number, number]),
      questionPoint: questionEmbedding ? [50, 50] : undefined,
    };
  }

  const allVectors = questionEmbedding
    ? [...embeddings, questionEmbedding]
    : [...embeddings];

  const nNeighbors = Math.min(15, allVectors.length - 1);
  const umap = new UMAP({
    nNeighbors: Math.max(2, nNeighbors),
    minDist: 0.1,
    nComponents: 2,
  });

  const result = umap.fit(allVectors);

  const points = result.slice(0, embeddings.length) as [number, number][];
  const questionPoint = questionEmbedding
    ? (result[result.length - 1] as [number, number])
    : undefined;

  return { points, questionPoint };
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}
