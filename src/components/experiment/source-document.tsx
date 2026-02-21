'use client';

import { useExperimentStore, SAMPLE_TEXTS, type Chunk } from '@/stores/experiment-store';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const CHUNK_COLORS = [
  { bg: 'bg-blue-100 dark:bg-blue-900/40', border: 'border-blue-300', dot: 'bg-blue-400' },
  { bg: 'bg-amber-100 dark:bg-amber-900/40', border: 'border-amber-300', dot: 'bg-amber-400' },
  { bg: 'bg-emerald-100 dark:bg-emerald-900/40', border: 'border-emerald-300', dot: 'bg-emerald-400' },
  { bg: 'bg-rose-100 dark:bg-rose-900/40', border: 'border-rose-300', dot: 'bg-rose-400' },
  { bg: 'bg-violet-100 dark:bg-violet-900/40', border: 'border-violet-300', dot: 'bg-violet-400' },
  { bg: 'bg-cyan-100 dark:bg-cyan-900/40', border: 'border-cyan-300', dot: 'bg-cyan-400' },
  { bg: 'bg-orange-100 dark:bg-orange-900/40', border: 'border-orange-300', dot: 'bg-orange-400' },
  { bg: 'bg-teal-100 dark:bg-teal-900/40', border: 'border-teal-300', dot: 'bg-teal-400' },
  { bg: 'bg-pink-100 dark:bg-pink-900/40', border: 'border-pink-300', dot: 'bg-pink-400' },
  { bg: 'bg-indigo-100 dark:bg-indigo-900/40', border: 'border-indigo-300', dot: 'bg-indigo-400' },
  { bg: 'bg-lime-100 dark:bg-lime-900/40', border: 'border-lime-300', dot: 'bg-lime-400' },
  { bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/40', border: 'border-fuchsia-300', dot: 'bg-fuchsia-400' },
];

export function getChunkColor(index: number) {
  return CHUNK_COLORS[index % CHUNK_COLORS.length];
}

interface SourceDocumentProps {
  hoveredChunk: Chunk | null;
  chunks?: Chunk[];
}

export function SourceDocument({ hoveredChunk, chunks = [] }: SourceDocumentProps) {
  const { sourceText, setSourceText } = useExperimentStore();

  const currentSample = SAMPLE_TEXTS.find((s) => s.content === sourceText);

  const handleSampleChange = (sampleId: string) => {
    if (sampleId === 'custom') return;
    const sample = SAMPLE_TEXTS.find((s) => s.id === sampleId);
    if (sample) setSourceText(sample.content);
  };

  const renderColoredText = () => {
    if (chunks.length === 0) {
      return <span>{sourceText}</span>;
    }

    // Build segments from chunks, sorted by startOffset
    const sorted = [...chunks].sort((a, b) => a.startOffset - b.startOffset);
    const segments: { text: string; chunkIndex: number | null; isHovered: boolean }[] = [];
    let pos = 0;

    for (const chunk of sorted) {
      // Gap before this chunk
      if (chunk.startOffset > pos) {
        segments.push({ text: sourceText.slice(pos, chunk.startOffset), chunkIndex: null, isHovered: false });
      }
      segments.push({
        text: sourceText.slice(chunk.startOffset, chunk.endOffset),
        chunkIndex: chunk.index,
        isHovered: hoveredChunk?.id === chunk.id,
      });
      pos = Math.max(pos, chunk.endOffset);
    }

    // Remaining text after last chunk
    if (pos < sourceText.length) {
      segments.push({ text: sourceText.slice(pos), chunkIndex: null, isHovered: false });
    }

    return segments.map((seg, i) => {
      if (seg.chunkIndex === null) {
        return <span key={i}>{seg.text}</span>;
      }
      const color = getChunkColor(seg.chunkIndex);
      return (
        <span
          key={i}
          className={`${color.bg} ${seg.isHovered ? 'ring-2 ring-primary ring-offset-1' : ''} rounded-sm transition-all`}
        >
          {seg.text}
        </span>
      );
    });
  };

  const hasChunks = chunks.length > 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <Label className="text-sm font-medium shrink-0">원본 문서</Label>
        <Select
          value={currentSample?.id ?? 'custom'}
          onValueChange={handleSampleChange}
        >
          <SelectTrigger className="h-7 w-auto max-w-[260px] text-xs">
            <SelectValue placeholder="샘플 선택" />
          </SelectTrigger>
          <SelectContent>
            {SAMPLE_TEXTS.map((s) => (
              <SelectItem key={s.id} value={s.id} className="text-xs">
                {s.title}
              </SelectItem>
            ))}
            {!currentSample && (
              <SelectItem value="custom" className="text-xs">
                직접 입력
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      {currentSample && (
        <p className="mb-2 text-xs text-muted-foreground">
          출처:{' '}
          <a
            href={currentSample.sourceUrl}
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {currentSample.source}
          </a>
        </p>
      )}
      {hasChunks ? (
        <div className="h-[400px] overflow-y-auto rounded-md border border-border bg-background p-3 text-sm whitespace-pre-wrap leading-relaxed">
          {renderColoredText()}
        </div>
      ) : (
        <Textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          className="h-[400px] resize-none text-sm"
          placeholder="여기에 문서 텍스트를 붙여넣으세요..."
        />
      )}
    </div>
  );
}
