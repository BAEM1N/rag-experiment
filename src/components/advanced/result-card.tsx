'use client';

import { Badge } from '@/components/ui/badge';

interface ResultCardProps {
  title?: string;
  content: string;
  score?: number;
  rank?: number;
  source?: 'retrieval' | 'sql';
  reason?: string;
  highlight?: boolean;
}

export function ResultCard({ title, content, score, rank, source, reason, highlight }: ResultCardProps) {
  return (
    <div
      className={`rounded-lg border p-3 text-sm ${
        highlight ? 'border-blue-300 bg-blue-50/50' : 'border-border'
      }`}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {rank !== undefined && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {rank}
            </span>
          )}
          {title && <span className="font-medium text-foreground">{title}</span>}
          {source && (
            <Badge variant="outline" className="text-[10px]">
              {source === 'sql' ? 'SQL' : '문서'}
            </Badge>
          )}
        </div>
        {score !== undefined && (
          <span className="font-mono text-xs text-muted-foreground">
            {score.toFixed(3)}
          </span>
        )}
      </div>
      <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{content}</p>
      {reason && (
        <p className="mt-1.5 text-xs text-blue-600 italic">{reason}</p>
      )}
    </div>
  );
}
