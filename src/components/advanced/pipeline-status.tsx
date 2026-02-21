'use client';

import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const STEPS = [
  { label: '데이터 준비', description: '문서 임베딩 + SQL 테이블' },
  { label: '질의 변환', description: 'HyDE + Multi-Query' },
  { label: '검색', description: 'Retrieval ∥ Text-to-SQL' },
  { label: '리랭킹', description: 'LLM 기반 재순위화' },
  { label: '응답 생성', description: '스트리밍 응답' },
];

interface PipelineStatusProps {
  currentStep: number;
  activeStep?: number;
}

export function PipelineStatus({ currentStep, activeStep }: PipelineStatusProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {STEPS.map((step, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === (activeStep ?? currentStep);
        const isPending = i > currentStep;

        return (
          <div key={step.label} className="flex items-center">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
                isActive
                  ? 'bg-foreground text-background'
                  : isCompleted
                  ? 'bg-green-100 text-green-800'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : isActive ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
              {step.label}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-1 h-px w-4 ${
                  isPending ? 'bg-muted' : 'bg-foreground/20'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
