'use client';

import { useState, useMemo } from 'react';
import { useExperimentStore } from '@/stores/experiment-store';
import { createEmbedding } from '@/lib/openai';
import { createIndex, bulkIndex, knnSearch } from '@/lib/opensearch';
import { cosineSimilarity } from '@/lib/umap';
import { SimilarityChart } from './similarity-chart';
import { ChunkCard } from './chunk-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

export function EmbeddingTab() {
  const {
    sessionId,
    openaiApiKey,
    chunks,
    embeddingModel,
    embeddingDimension,
    embeddings,
    setEmbeddings,
    isEmbedding,
    setIsEmbedding,
    isEmbedded,
    setIsEmbedded,
    embeddingProgress,
    setEmbeddingProgress,
    indexName,
    setIndexName,
    questionText,
    setQuestionText,
    questionEmbedding,
    setQuestionEmbedding,
    topK,
    knnResults,
    setKnnResults,
  } = useExperimentStore();

  const [error, setError] = useState<string | null>(null);

  const handleEmbedAndIndex = async () => {
    if (!openaiApiKey) {
      setError('OpenAI API 키를 먼저 입력해주세요');
      return;
    }
    if (chunks.length === 0) {
      setError('임베딩할 청크가 없습니다. 먼저 텍스트를 분할해주세요.');
      return;
    }

    setError(null);
    setIsEmbedding(true);
    setEmbeddingProgress(0);

    try {
      // Batch embed chunks (max 20 at a time to avoid rate limits)
      const allEmbeddings: number[][] = [];
      const batchSize = 20;
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const texts = batch.map((c) => c.content);
        const batchEmbeddings = await createEmbedding(
          texts,
          openaiApiKey,
          embeddingModel,
          embeddingDimension
        );
        allEmbeddings.push(...batchEmbeddings);
        setEmbeddingProgress(Math.round(((i + batch.length) / chunks.length) * 70));
      }
      setEmbeddings(allEmbeddings);

      // Create OpenSearch index
      const newIndexName = `rag-${sessionId}-${Date.now()}`;
      await createIndex(newIndexName, embeddingDimension);
      setIndexName(newIndexName);
      setEmbeddingProgress(85);

      // Bulk index
      const documents = chunks.map((chunk, i) => ({
        id: chunk.id,
        content: chunk.content,
        embedding: allEmbeddings[i],
        index: chunk.index,
      }));
      await bulkIndex(newIndexName, documents);
      setEmbeddingProgress(100);
      setIsEmbedded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Embedding failed');
    } finally {
      setIsEmbedding(false);
    }
  };

  const handleQuestionEmbed = async () => {
    if (!openaiApiKey || !questionText.trim() || !isEmbedded) return;

    try {
      const [embedding] = await createEmbedding(
        [questionText],
        openaiApiKey,
        embeddingModel,
        embeddingDimension
      );
      setQuestionEmbedding(embedding);

      // KNN search
      const result = await knnSearch(indexName, embedding, topK);
      setKnnResults(result.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Question embedding failed');
    }
  };

  // Compute similarities for display
  const similarities = useMemo(() => {
    if (!questionEmbedding.length || !embeddings.length) return [];
    return embeddings.map((emb) => cosineSimilarity(emb, questionEmbedding));
  }, [embeddings, questionEmbedding]);

  // Get nearest chunk indices
  const nearestIndices = useMemo(() => {
    if (!similarities.length) return [];
    return similarities
      .map((sim, i) => ({ sim, i }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, topK)
      .map((item) => item.i);
  }, [similarities, topK]);

  // Sort chunks by similarity for the "Similar Chunks" column
  const sortedBySimilarity = useMemo(() => {
    if (!similarities.length) return [];
    return chunks
      .map((chunk, i) => ({ chunk, similarity: similarities[i], index: i }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }, [chunks, similarities, topK]);

  if (!openaiApiKey) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        임베딩 기능을 사용하려면 OpenAI API 키를 먼저 입력해주세요.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">벡터 임베딩 & 유사도</h2>
        <p className="text-sm text-muted-foreground">
          텍스트 청크를 벡터 임베딩으로 변환하고, 질문을 통해 의미 검색으로 유사한 콘텐츠를 찾습니다
        </p>
      </div>

      {/* Embed Action */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          onClick={handleEmbedAndIndex}
          disabled={isEmbedding || chunks.length === 0}
        >
          {isEmbedding ? '임베딩 중...' : isEmbedded ? '재임베딩 & 인덱싱' : '임베딩 & 인덱싱'}
        </Button>
        <span className="text-xs text-muted-foreground">
          모델: {embeddingModel} ({embeddingDimension}차원)
        </span>
      </div>

      {/* Progress */}
      {isEmbedding && (
        <div className="mb-6">
          <Progress value={embeddingProgress} className="h-2" />
          <p className="mt-1 text-xs text-muted-foreground">
            {embeddingProgress < 70
              ? `청크 임베딩 중... ${embeddingProgress}%`
              : embeddingProgress < 85
              ? 'OpenSearch 인덱스 생성 중...'
              : embeddingProgress < 100
              ? '문서 인덱싱 중...'
              : '완료!'}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isEmbedded && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {embeddings.length}개 청크가 인덱스에 저장됨: <code className="font-mono text-xs">{indexName}</code>
        </div>
      )}

      {/* Question Input */}
      <div className="mb-6">
        <Label className="text-sm">유사한 콘텐츠를 찾기 위한 질문 입력:</Label>
        <div className="mt-1 flex gap-2">
          <Input
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="RAG란 무엇인가요?"
            onKeyDown={(e) => e.key === 'Enter' && handleQuestionEmbed()}
          />
          <Button onClick={handleQuestionEmbed} disabled={!isEmbedded || !questionText.trim()}>
            검색
          </Button>
        </div>
        {questionEmbedding.length > 0 && (
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            [{questionEmbedding.slice(0, 5).map((v) => v.toFixed(4)).join(', ')}, ...]
          </p>
        )}
      </div>

      {/* UMAP Chart */}
      <div className="mb-6">
        <SimilarityChart
          embeddings={embeddings}
          questionEmbedding={questionEmbedding.length > 0 ? questionEmbedding : undefined}
          nearestIndices={nearestIndices}
        />
      </div>

      {/* Three columns: Chunks / Embeddings / Similar Chunks */}
      {embeddings.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div>
            <h3 className="mb-3 text-sm font-medium">청크</h3>
            <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
              {chunks.map((chunk) => (
                <ChunkCard key={chunk.id} chunk={chunk} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium">청크 임베딩 벡터</h3>
            <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
              {chunks.map((chunk, i) => (
                <ChunkCard
                  key={chunk.id}
                  chunk={chunk}
                  showEmbedding
                  embedding={embeddings[i]}
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium">유사 청크</h3>
            {sortedBySimilarity.length > 0 ? (
              <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
                {sortedBySimilarity.map(({ chunk, similarity }) => (
                  <ChunkCard
                    key={chunk.id}
                    chunk={chunk}
                    similarity={similarity}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                질문을 입력하면 유사한 청크를 확인할 수 있습니다
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
