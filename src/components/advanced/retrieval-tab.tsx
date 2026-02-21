'use client';

import { useState } from 'react';
import { useAdvancedStore } from '@/stores/advanced-store';
import { createEmbedding } from '@/lib/openai';
import { knnSearch } from '@/lib/opensearch';
import { ResultCard } from './result-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Database } from 'lucide-react';

export function RetrievalTab() {
  const {
    openaiApiKey,
    queryText,
    hydeDocument,
    multiQueries,
    indexName,
    embeddingModel,
    embeddingDimension,
    isEmbedded,
    isSqlReady,
    retrievalResults,
    setRetrievalResults,
    isRetrieving,
    setIsRetrieving,
    sqlResult,
    setSqlResult,
    isExecutingSql,
    setIsExecutingSql,
    generatedSql,
    setGeneratedSql,
    setBeforeRerank,
  } = useAdvancedStore();

  const [error, setError] = useState<string | null>(null);

  const handleRetrieve = async () => {
    if (!openaiApiKey || !queryText.trim()) {
      setError('질문과 API 키가 필요합니다');
      return;
    }

    setError(null);

    // Run vector retrieval and text-to-sql in parallel
    await Promise.all([handleVectorRetrieval(), handleTextToSql()]);
  };

  const handleVectorRetrieval = async () => {
    setIsRetrieving(true);
    setRetrievalResults([]);

    try {
      // Gather all search queries: original + HyDE + multi-queries
      const searchTexts: string[] = [queryText];
      if (hydeDocument) searchTexts.push(hydeDocument);
      if (multiQueries.length > 0) searchTexts.push(...multiQueries);

      // Embed all search queries
      const embeddings = await createEmbedding(
        searchTexts,
        openaiApiKey,
        embeddingModel,
        embeddingDimension
      );

      // Search with each embedding and deduplicate
      const allResults = new Map<string, { id: string; content: string; score: number }>();

      for (const embedding of embeddings) {
        const result = await knnSearch(indexName, embedding, 5);
        for (const r of result.results) {
          const existing = allResults.get(r.id);
          if (!existing || r.score > existing.score) {
            allResults.set(r.id, r);
          }
        }
      }

      // Sort by score and take top results
      const sorted = Array.from(allResults.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 7);

      setRetrievalResults(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Retrieval failed');
    } finally {
      setIsRetrieving(false);
    }
  };

  const handleTextToSql = async () => {
    setIsExecutingSql(true);
    setSqlResult(null);
    setGeneratedSql('');

    try {
      const response = await fetch('/api/advanced/text-to-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiApiKey}` },
        body: JSON.stringify({ query: queryText }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Text-to-SQL failed');
      }

      const data = await response.json();
      setGeneratedSql(data.generatedSql);
      setSqlResult({
        columns: data.columns,
        rows: data.rows,
        query: data.generatedSql,
        narrative: data.narrative,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Text-to-SQL failed');
    } finally {
      setIsExecutingSql(false);
    }
  };

  // Build combined results for reranking
  const handlePrepareRerank = () => {
    const combined = [];
    let rank = 1;

    for (const r of retrievalResults) {
      combined.push({
        content: r.content,
        source: 'retrieval' as const,
        originalRank: rank++,
      });
    }

    if (sqlResult?.narrative) {
      combined.push({
        content: sqlResult.narrative,
        source: 'sql' as const,
        originalRank: rank++,
      });
    }

    if (sqlResult?.rows && sqlResult.rows.length > 0) {
      const tableStr = sqlResult.rows
        .map((row) => Object.entries(row).map(([k, v]) => `${k}: ${v}`).join(', '))
        .join('\n');
      combined.push({
        content: `[SQL 테이블 데이터]\n${tableStr}`,
        source: 'sql' as const,
        originalRank: rank++,
      });
    }

    setBeforeRerank(combined);
  };

  // Auto-prepare rerank when results are available
  const hasResults = retrievalResults.length > 0 || sqlResult !== null;

  if (!openaiApiKey) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        검색 기능을 사용하려면 OpenAI API 키를 먼저 입력해주세요.
      </div>
    );
  }

  if (!isEmbedded || !isSqlReady) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        먼저 &quot;데이터 준비&quot; 탭에서 데이터를 준비해주세요.
      </div>
    );
  }

  if (!queryText.trim()) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        &quot;질의 변환&quot; 탭에서 질문을 입력해주세요.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">검색</h2>
          <p className="text-sm text-muted-foreground">
            벡터 검색(Retrieval)과 Text-to-SQL을 병렬로 실행하여 정성+정량 데이터를 함께 가져옵니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRetrieve}
            disabled={isRetrieving || isExecutingSql}
          >
            {isRetrieving || isExecutingSql ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                검색 중...
              </>
            ) : (
              '병렬 검색 실행'
            )}
          </Button>
          {hasResults && (
            <Button variant="outline" onClick={handlePrepareRerank}>
              리랭킹 준비 →
            </Button>
          )}
        </div>
      </div>

      <div className="mb-4 rounded-lg bg-muted/50 p-3 text-sm">
        <span className="font-medium">현재 질의:</span>{' '}
        <span className="text-muted-foreground">{queryText}</span>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Two columns: Vector Retrieval + Text-to-SQL */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Vector Retrieval */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Search className="h-4 w-4" />
            <h3 className="text-sm font-medium">벡터 검색 (Retrieval)</h3>
            {retrievalResults.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {retrievalResults.length}건
              </Badge>
            )}
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            원본 + HyDE + Multi-Query 임베딩으로 통합 검색
          </p>
          {isRetrieving ? (
            <div className="flex items-center gap-2 rounded-lg border border-border p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              벡터 검색 중...
            </div>
          ) : retrievalResults.length > 0 ? (
            <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
              {retrievalResults.map((r, i) => (
                <ResultCard
                  key={r.id}
                  content={r.content}
                  score={r.score}
                  rank={i + 1}
                  source="retrieval"
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              &quot;병렬 검색 실행&quot;을 클릭하세요
            </div>
          )}
        </div>

        {/* Text-to-SQL */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Database className="h-4 w-4" />
            <h3 className="text-sm font-medium">Text-to-SQL</h3>
            {sqlResult && (
              <Badge variant="secondary" className="text-xs">
                {sqlResult.rows.length}행
              </Badge>
            )}
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            자연어 → SQL 변환 → 실행 → 결과 내러티브
          </p>
          {isExecutingSql ? (
            <div className="flex items-center gap-2 rounded-lg border border-border p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              SQL 생성 및 실행 중...
            </div>
          ) : sqlResult ? (
            <div className="space-y-3">
              {/* Generated SQL */}
              <div className="rounded-lg border border-border p-3">
                <Badge variant="outline" className="mb-2 text-xs">
                  생성된 SQL
                </Badge>
                <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                  {generatedSql}
                </pre>
              </div>

              {/* SQL Results Table */}
              {sqlResult.rows.length > 0 && (
                <div className="rounded-lg border border-border overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        {sqlResult.columns.map((col) => (
                          <th key={col} className="px-3 py-2 text-left font-medium">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sqlResult.rows.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          {sqlResult.columns.map((col) => (
                            <td key={col} className="px-3 py-2 text-muted-foreground">
                              {String(row[col] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {sqlResult.rows.length > 10 && (
                    <p className="px-3 py-2 text-xs text-muted-foreground">
                      ... 외 {sqlResult.rows.length - 10}행
                    </p>
                  )}
                </div>
              )}

              {/* Narrative */}
              {sqlResult.narrative && (
                <div className="rounded-lg border border-border p-3">
                  <Badge variant="outline" className="mb-2 text-xs">
                    결과 해석
                  </Badge>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {sqlResult.narrative}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              &quot;병렬 검색 실행&quot;을 클릭하세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
