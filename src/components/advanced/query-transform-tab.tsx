'use client';

import { useState } from 'react';
import { useAdvancedStore } from '@/stores/advanced-store';
import { DEMO_QUERIES } from '@/lib/sample-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, GitFork } from 'lucide-react';

export function QueryTransformTab() {
  const {
    openaiApiKey,
    queryText,
    setQueryText,
    hydeDocument,
    setHydeDocument,
    isGeneratingHyde,
    setIsGeneratingHyde,
    multiQueries,
    setMultiQueries,
    isGeneratingMultiQuery,
    setIsGeneratingMultiQuery,
    isEmbedded,
    isSqlReady,
  } = useAdvancedStore();

  const [error, setError] = useState<string | null>(null);

  const handleTransform = async () => {
    if (!openaiApiKey) {
      setError('OpenAI API 키를 먼저 입력해주세요');
      return;
    }
    if (!queryText.trim()) {
      setError('질문을 입력해주세요');
      return;
    }

    setError(null);

    // Run HyDE and Multi-Query in parallel
    await Promise.all([handleHyde(), handleMultiQuery()]);
  };

  const handleHyde = async () => {
    setIsGeneratingHyde(true);
    setHydeDocument('');
    try {
      const response = await fetch('/api/advanced/hyde', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiApiKey}` },
        body: JSON.stringify({ query: queryText }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'HyDE generation failed');
      }

      const data = await response.json();
      setHydeDocument(data.hydeDocument);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'HyDE failed');
    } finally {
      setIsGeneratingHyde(false);
    }
  };

  const handleMultiQuery = async () => {
    setIsGeneratingMultiQuery(true);
    setMultiQueries([]);
    try {
      const response = await fetch('/api/advanced/multi-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiApiKey}` },
        body: JSON.stringify({ query: queryText }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Multi-query generation failed');
      }

      const data = await response.json();
      setMultiQueries(data.queries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Multi-query failed');
    } finally {
      setIsGeneratingMultiQuery(false);
    }
  };

  if (!openaiApiKey) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        질의 변환 기능을 사용하려면 OpenAI API 키를 먼저 입력해주세요.
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

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">질의 변환</h2>
        <p className="text-sm text-muted-foreground">
          HyDE(가상 문서 임베딩)와 Multi-Query(질의 확장)로 검색 효과를 높입니다
        </p>
      </div>

      {/* Query Input */}
      <div className="mb-6">
        <Label className="text-sm">질문 입력:</Label>
        <div className="mt-1 flex gap-2">
          <Input
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="삼성SDS에 대해 질문해보세요"
            onKeyDown={(e) => e.key === 'Enter' && handleTransform()}
          />
          <Button
            onClick={handleTransform}
            disabled={isGeneratingHyde || isGeneratingMultiQuery || !queryText.trim()}
          >
            {isGeneratingHyde || isGeneratingMultiQuery ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                변환 중...
              </>
            ) : (
              '질의 변환'
            )}
          </Button>
        </div>
      </div>

      {/* Demo queries */}
      <div className="mb-6">
        <p className="mb-2 text-xs text-muted-foreground">예시 질의:</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => setQueryText(q)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Results: HyDE + Multi-Query */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* HyDE */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <h3 className="text-sm font-medium">HyDE - 가상 문서 생성</h3>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            질문에 대한 가상 답변 문서를 생성하여, 이를 임베딩에 활용합니다.
            실제 답변 문서와 유사한 벡터 공간에 위치하게 되어 검색 정확도가 향상됩니다.
          </p>
          {isGeneratingHyde ? (
            <div className="flex items-center gap-2 rounded-lg border border-border p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              가상 문서 생성 중...
            </div>
          ) : hydeDocument ? (
            <div className="rounded-lg border border-border p-4">
              <Badge variant="secondary" className="mb-2 text-xs">
                가상 문서 (Hypothetical Document)
              </Badge>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                {hydeDocument}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              질문을 입력하고 &quot;질의 변환&quot;을 클릭하세요
            </div>
          )}
        </div>

        {/* Multi-Query */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <GitFork className="h-4 w-4" />
            <h3 className="text-sm font-medium">Multi-Query - 질의 확장</h3>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            원래 질문을 다양한 관점에서 재구성하여 여러 변형 질의를 생성합니다.
            각 변형 질의로 검색하면 더 다양한 관련 문서를 찾을 수 있습니다.
          </p>
          {isGeneratingMultiQuery ? (
            <div className="flex items-center gap-2 rounded-lg border border-border p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              변형 질의 생성 중...
            </div>
          ) : multiQueries.length > 0 ? (
            <div className="space-y-2">
              <div className="rounded-lg border border-border p-3">
                <Badge variant="default" className="mb-2 text-xs">
                  원본 질의
                </Badge>
                <p className="text-sm">{queryText}</p>
              </div>
              {multiQueries.map((q, i) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <Badge variant="secondary" className="mb-2 text-xs">
                    변형 {i + 1}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{q}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              질문을 입력하고 &quot;질의 변환&quot;을 클릭하세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
