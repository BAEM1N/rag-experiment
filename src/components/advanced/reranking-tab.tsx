'use client';

import { useState } from 'react';
import { useAdvancedStore } from '@/stores/advanced-store';
import { ResultCard } from './result-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRightLeft, ArrowRight } from 'lucide-react';

export function RerankingTab() {
  const {
    openaiApiKey,
    queryText,
    beforeRerank,
    afterRerank,
    setAfterRerank,
    isReranking,
    setIsReranking,
  } = useAdvancedStore();

  const [error, setError] = useState<string | null>(null);

  const handleRerank = async () => {
    if (!openaiApiKey) {
      setError('OpenAI API 키를 먼저 입력해주세요');
      return;
    }
    if (beforeRerank.length === 0) {
      setError('리랭킹할 결과가 없습니다. 검색 탭에서 "리랭킹 준비"를 클릭해주세요.');
      return;
    }

    setError(null);
    setIsReranking(true);
    setAfterRerank([]);

    try {
      const response = await fetch('/api/advanced/rerank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiApiKey}` },
        body: JSON.stringify({
          query: queryText,
          results: beforeRerank,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Reranking failed');
      }

      const data = await response.json();
      setAfterRerank(data.reranked);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reranking failed');
    } finally {
      setIsReranking(false);
    }
  };

  if (!openaiApiKey) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        리랭킹 기능을 사용하려면 OpenAI API 키를 먼저 입력해주세요.
      </div>
    );
  }

  if (beforeRerank.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        검색 탭에서 검색 실행 후 &quot;리랭킹 준비&quot; 버튼을 클릭해주세요.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">리랭킹</h2>
          <p className="text-sm text-muted-foreground">
            LLM이 검색 결과의 관련성을 재평가하여 최적의 순서로 재배치합니다
          </p>
        </div>
        <Button
          onClick={handleRerank}
          disabled={isReranking || beforeRerank.length === 0}
        >
          {isReranking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              리랭킹 중...
            </>
          ) : (
            <>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              리랭킹 실행
            </>
          )}
        </Button>
      </div>

      <div className="mb-4 rounded-lg bg-muted/50 p-3 text-sm">
        <span className="font-medium">질의:</span>{' '}
        <span className="text-muted-foreground">{queryText}</span>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Before / After comparison */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr]">
        {/* Before */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-sm font-medium">리랭킹 전</h3>
            <Badge variant="secondary" className="text-xs">
              {beforeRerank.length}건
            </Badge>
          </div>
          <div className="space-y-2">
            {beforeRerank.map((r, i) => (
              <ResultCard
                key={i}
                content={r.content.length > 200 ? r.content.slice(0, 200) + '...' : r.content}
                rank={i + 1}
                source={r.source}
              />
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <ArrowRight className="h-6 w-6 text-muted-foreground hidden lg:block" />
        </div>

        {/* After */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-sm font-medium">리랭킹 후</h3>
            {afterRerank.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {afterRerank.length}건
              </Badge>
            )}
          </div>
          {isReranking ? (
            <div className="flex items-center gap-2 rounded-lg border border-border p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              LLM이 관련성을 평가 중...
            </div>
          ) : afterRerank.length > 0 ? (
            <div className="space-y-2">
              {afterRerank.map((r, i) => (
                <ResultCard
                  key={i}
                  content={r.content.length > 200 ? r.content.slice(0, 200) + '...' : r.content}
                  rank={r.newRank}
                  score={r.relevanceScore}
                  source={r.source}
                  reason={r.reason}
                  highlight={r.relevanceScore !== undefined && r.relevanceScore >= 0.7}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              &quot;리랭킹 실행&quot;을 클릭하여 결과를 확인하세요
            </div>
          )}
        </div>
      </div>

      {/* Rank changes summary */}
      {afterRerank.length > 0 && (
        <div className="mt-6 rounded-lg border border-border p-4">
          <h4 className="mb-2 text-sm font-medium">순위 변동 요약</h4>
          <div className="flex flex-wrap gap-3">
            {afterRerank.map((r) => {
              const change = r.originalRank - (r.newRank || 0);
              return (
                <div key={r.newRank} className="flex items-center gap-1 text-xs">
                  <Badge variant="outline" className="text-[10px]">
                    {r.source === 'sql' ? 'SQL' : '문서'}
                  </Badge>
                  <span className="text-muted-foreground">
                    #{r.originalRank} → #{r.newRank}
                  </span>
                  {change > 0 && <span className="text-green-600">↑{change}</span>}
                  {change < 0 && <span className="text-red-600">↓{Math.abs(change)}</span>}
                  {change === 0 && <span className="text-muted-foreground">-</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
