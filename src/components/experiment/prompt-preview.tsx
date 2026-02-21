'use client';

import { useState } from 'react';
import { useExperimentStore, type SearchResult } from '@/stores/experiment-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface PromptPreviewProps {
  contextResults: SearchResult[];
}

export function PromptPreview({ contextResults }: PromptPreviewProps) {
  const { systemMessage, setSystemMessage, questionText } = useExperimentStore();
  const [editingSystem, setEditingSystem] = useState(false);
  const [editingUser, setEditingUser] = useState(false);
  const [userMessage, setUserMessage] = useState('');

  const contextText = contextResults.map((r) => r.content).join('\n\n');

  const fullSystemPrompt = systemMessage + (contextText ? `\n\nContext:\n${contextText}` : '');
  const finalUserMessage = userMessage || questionText;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">프롬프트 미리보기:</h3>

      {/* System Message */}
      <div className="rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="text-sm font-medium">시스템 메시지</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingSystem(!editingSystem)}
            className="text-xs"
          >
            {editingSystem ? '완료' : '메시지 수정'}
          </Button>
        </div>
        <div className="p-4">
          {editingSystem ? (
            <Textarea
              value={systemMessage}
              onChange={(e) => setSystemMessage(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          ) : (
            <div className="text-sm whitespace-pre-wrap">
              <p>{systemMessage}</p>
              {contextText && (
                <>
                  <p className="mt-3 font-medium">컨텍스트:</p>
                  <p className="mt-1 text-muted-foreground">{contextText}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Message */}
      <div className="rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="text-sm font-medium">사용자 메시지</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingUser(!editingUser)}
            className="text-xs"
          >
            {editingUser ? '완료' : '메시지 수정'}
          </Button>
        </div>
        <div className="p-4">
          {editingUser ? (
            <Textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder={questionText || '질문을 입력하세요...'}
              className="min-h-[60px] text-sm"
            />
          ) : (
            <p className="text-sm">{finalUserMessage || '아직 질문이 입력되지 않았습니다'}</p>
          )}
        </div>
      </div>
    </div>
  );
}
