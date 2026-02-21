'use client';

import { useState } from 'react';
import { useExperimentStore } from '@/stores/experiment-store';
import { streamChat } from '@/lib/openai';
import { PromptPreview } from './prompt-preview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function GenerationTab() {
  const {
    openaiApiKey,
    chatModel,
    temperature,
    setTemperature,
    maxTokens,
    setMaxTokens,
    systemMessage,
    questionText,
    selectedSearchTab,
    setSelectedSearchTab,
    knnResults,
    keywordResults,
    hybridResults,
    generatedResponse,
    setGeneratedResponse,
    isGenerating,
    setIsGenerating,
  } = useExperimentStore();

  const [error, setError] = useState<string | null>(null);

  const contextResults =
    selectedSearchTab === 'knn'
      ? knnResults
      : selectedSearchTab === 'keyword'
      ? keywordResults
      : hybridResults;

  const handleGenerate = async () => {
    if (!openaiApiKey) {
      setError('OpenAI API 키를 먼저 입력해주세요');
      return;
    }
    if (!questionText.trim()) {
      setError('질문을 먼저 입력해주세요');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGeneratedResponse('');

    try {
      const contextText = contextResults.map((r) => r.content).join('\n\n');
      const fullSystemMessage = systemMessage + (contextText ? `\n\nContext:\n${contextText}` : '');

      const messages = [
        { role: 'system', content: fullSystemMessage },
        { role: 'user', content: questionText },
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

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">응답 생성</h2>
          <p className="text-sm text-muted-foreground">
            LLM이 검색된 컨텍스트와 사용자 질문을 결합하여 정확한 응답을 생성하는 과정을 관찰합니다
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? '생성 중...' : '응답 생성'}
        </Button>
      </div>

      {/* Controls */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
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
        <div>
          <Label className="text-sm">검색 방식:</Label>
          <Select
            value={selectedSearchTab}
            onValueChange={(v) => setSelectedSearchTab(v as 'knn' | 'keyword' | 'hybrid')}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="knn">벡터 검색</SelectItem>
              <SelectItem value="keyword">키워드 검색</SelectItem>
              <SelectItem value="hybrid">하이브리드 검색</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Prompt Preview + Model Response */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PromptPreview contextResults={contextResults} />

        <div>
          <h3 className="mb-4 text-sm font-medium">모델 응답:</h3>
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
