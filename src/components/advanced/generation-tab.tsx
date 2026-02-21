'use client';

import { useState } from 'react';
import { useAdvancedStore } from '@/stores/advanced-store';
import { streamChat } from '@/lib/openai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export function GenerationTab() {
  const {
    openaiApiKey,
    queryText,
    afterRerank,
    beforeRerank,
    chatModel,
    temperature,
    setTemperature,
    maxTokens,
    setMaxTokens,
    generatedResponse,
    setGeneratedResponse,
    isGenerating,
    setIsGenerating,
  } = useAdvancedStore();

  const [error, setError] = useState<string | null>(null);

  // Use reranked results if available, otherwise use pre-rerank
  const contextResults = afterRerank.length > 0 ? afterRerank : beforeRerank;

  const handleGenerate = async () => {
    if (!openaiApiKey) {
      setError('OpenAI API 키를 먼저 입력해주세요');
      return;
    }
    if (!queryText.trim()) {
      setError('질문이 없습니다');
      return;
    }
    if (contextResults.length === 0) {
      setError('컨텍스트가 없습니다. 이전 단계를 먼저 완료해주세요.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGeneratedResponse('');

    try {
      const contextText = contextResults
        .map((r, i) => `[${i + 1}] (${r.source === 'sql' ? 'SQL 데이터' : '문서 검색'}): ${r.content}`)
        .join('\n\n');

      const systemMessage = `당신은 삼성SDS에 대한 질문에 답변하는 전문 AI 어시스턴트입니다.
아래 제공된 컨텍스트를 활용하여 사용자의 질문에 정확하고 구체적으로 답변하세요.
컨텍스트에는 문서 검색 결과와 SQL 데이터가 포함되어 있습니다.
수치 데이터가 있으면 정확한 숫자를 인용하고, 정성적 분석도 함께 제공하세요.
답을 모르면 모른다고 솔직하게 말하세요.

컨텍스트:
${contextText}`;

      const messages = [
        { role: 'system', content: systemMessage },
        { role: 'user', content: queryText },
      ];

      let response = '';
      for await (const chunk of streamChat(
        messages,
        openaiApiKey,
        chatModel,
        temperature,
        maxTokens
      )) {
        response += chunk;
        setGeneratedResponse(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!openaiApiKey) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        응답 생성 기능을 사용하려면 OpenAI API 키를 먼저 입력해주세요.
      </div>
    );
  }

  if (contextResults.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        이전 단계(검색 → 리랭킹)를 먼저 완료해주세요.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">응답 생성</h2>
          <p className="text-sm text-muted-foreground">
            리랭킹된 컨텍스트를 기반으로 LLM이 종합 답변을 스트리밍 생성합니다
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              생성 중...
            </>
          ) : (
            '응답 생성'
          )}
        </Button>
      </div>

      {/* Controls */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm">온도(Temperature):</Label>
          <Input
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            min={0}
            max={2}
            step={0.1}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm">최대 토큰:</Label>
          <Input
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
            min={100}
            max={4000}
            step={100}
            className="mt-1"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Context + Response */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Context */}
        <div>
          <h3 className="mb-3 text-sm font-medium">
            사용된 컨텍스트{' '}
            <span className="font-normal text-muted-foreground">
              ({afterRerank.length > 0 ? '리랭킹 후' : '리랭킹 전'})
            </span>
          </h3>
          <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
            {contextResults.map((r, i) => (
              <div key={i} className="rounded-lg border border-border p-3 text-xs">
                <div className="mb-1 flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                    {i + 1}
                  </span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] ${
                    r.source === 'sql' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {r.source === 'sql' ? 'SQL' : '문서'}
                  </span>
                  {r.relevanceScore !== undefined && (
                    <span className="font-mono text-muted-foreground">
                      {r.relevanceScore.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {r.content.length > 150 ? r.content.slice(0, 150) + '...' : r.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Response */}
        <div>
          <h3 className="mb-3 text-sm font-medium">모델 응답:</h3>
          <div className="min-h-[300px] rounded-lg border border-border p-4">
            {generatedResponse ? (
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">
                {generatedResponse}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isGenerating
                  ? '응답 생성 중...'
                  : '"응답 생성" 버튼을 클릭하면 모델의 답변을 확인할 수 있습니다'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
