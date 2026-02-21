'use client';

import { useState } from 'react';
import { useExperimentStore } from '@/stores/experiment-store';
import { createEmbedding } from '@/lib/openai';
import { hybridSearch } from '@/lib/opensearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export function HybridSearchTab() {
  const {
    openaiApiKey,
    indexName,
    isEmbedded,
    embeddingModel,
    embeddingDimension,
    questionText,
    setQuestionText,
    questionEmbedding,
    setQuestionEmbedding,
    topK,
    hybridResults,
    setHybridResults,
    vectorWeight,
    setVectorWeight,
    textWeight,
    setTextWeight,
  } = useExperimentStore();

  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryPreview, setQueryPreview] = useState<object | null>(null);

  const handleWeightChange = (value: number[]) => {
    const vw = value[0] / 100;
    setVectorWeight(Math.round(vw * 100) / 100);
    setTextWeight(Math.round((1 - vw) * 100) / 100);
  };

  const handleSearch = async () => {
    if (!questionText.trim() || !indexName || !openaiApiKey) return;

    setError(null);
    setIsSearching(true);

    try {
      // Embed question if not already embedded
      let qEmb = questionEmbedding;
      if (!qEmb.length) {
        const [embedding] = await createEmbedding(
          [questionText],
          openaiApiKey,
          embeddingModel,
          embeddingDimension
        );
        qEmb = embedding;
        setQuestionEmbedding(embedding);
      }

      const result = await hybridSearch(
        indexName,
        qEmb,
        questionText,
        topK,
        vectorWeight,
        textWeight
      );
      setHybridResults(result.results);
      setQueryPreview(result.query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hybrid search failed');
    } finally {
      setIsSearching(false);
    }
  };

  if (!isEmbedded) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
        <p className="text-lg font-medium">임베딩 필요</p>
        <p className="text-sm">먼저 벡터 임베딩 탭에서 청크를 임베딩하고 인덱싱해주세요.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">하이브리드 검색</h2>
        <p className="text-sm text-muted-foreground">
          KNN 벡터 검색과 BM25 키워드 검색을 가중치 조절로 결합하여 최적의 검색 결과를 제공합니다.
        </p>
      </div>

      {/* Weight Slider */}
      <div className="mb-6 rounded-lg border border-border p-4">
        <Label className="text-sm font-medium">검색 가중치 비율</Label>
        <div className="mt-4 flex items-center gap-4">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            벡터: {(vectorWeight * 100).toFixed(0)}%
          </span>
          <Slider
            value={[vectorWeight * 100]}
            onValueChange={handleWeightChange}
            max={100}
            min={0}
            step={5}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            텍스트: {(textWeight * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <Label className="text-sm">검색 쿼리:</Label>
        <div className="mt-1 flex gap-2">
          <Input
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="검색어를 입력하세요..."
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching || !questionText.trim()}>
            {isSearching ? '검색 중...' : '하이브리드 검색'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Results */}
        <div>
          <h3 className="mb-3 text-sm font-medium">
            하이브리드 결과 {hybridResults.length > 0 && `(${hybridResults.length}건)`}
          </h3>
          {hybridResults.length > 0 ? (
            <div className="space-y-3">
              {hybridResults.map((result, i) => (
                <div key={result.id} className="rounded-lg border border-border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">결과 {i + 1}</span>
                    <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                      결합 점수: {result.score.toFixed(4)}
                    </span>
                  </div>
                  <p className="mb-2 text-sm whitespace-pre-wrap">{result.content}</p>
                  {result.highlight && result.highlight.length > 0 && (
                    <div className="mt-2 border-t border-border pt-2">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">매칭 하이라이트:</p>
                      {result.highlight.map((h, hi) => (
                        <p
                          key={hi}
                          className="text-xs text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: h.replace(/<(?!\/?mark>)[^>]*>/gi, '') }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              쿼리를 입력하고 하이브리드 검색 버튼을 클릭하세요
            </p>
          )}
        </div>

        {/* Query Preview */}
        <div>
          <h3 className="mb-3 text-sm font-medium">OpenSearch 하이브리드 쿼리</h3>
          {queryPreview ? (
            <pre className="max-h-[500px] overflow-auto rounded-lg border border-border bg-muted p-4 text-xs">
              {JSON.stringify(queryPreview, null, 2)}
            </pre>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              검색을 실행하면 쿼리를 확인할 수 있습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
