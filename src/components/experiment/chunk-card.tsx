'use client';

import type { Chunk } from '@/stores/experiment-store';
import { getChunkColor } from './source-document';

interface ChunkCardProps {
  chunk: Chunk;
  isHovered?: boolean;
  onHover?: (chunk: Chunk | null) => void;
  similarity?: number;
  showEmbedding?: boolean;
  embedding?: number[];
  showColor?: boolean;
}

export function ChunkCard({
  chunk,
  isHovered,
  onHover,
  similarity,
  showEmbedding,
  embedding,
  showColor,
}: ChunkCardProps) {
  const color = getChunkColor(chunk.index);

  return (
    <div
      className={`rounded-lg border p-3 text-sm transition-colors ${
        isHovered ? `${color.border} ${color.bg}` : 'border-border'
      }`}
      onMouseEnter={() => onHover?.(chunk)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
          {showColor !== false && (
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${color.dot}`} />
          )}
          청크 {chunk.index + 1}
        </span>
        <div className="flex items-center gap-2">
          {chunk.parentId && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              {chunk.parentId}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {chunk.content.length}자
          </span>
          {similarity !== undefined && (
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800">
              {(similarity * 100).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      <p className="whitespace-pre-wrap break-words text-xs leading-relaxed">
        {chunk.content}
      </p>
      {showEmbedding && embedding && (
        <div className="mt-2 rounded bg-muted p-2">
          <p className="font-mono text-xs text-muted-foreground">
            [{embedding.slice(0, 5).map((v) => v.toFixed(4)).join(', ')}, ...]
          </p>
        </div>
      )}
    </div>
  );
}
