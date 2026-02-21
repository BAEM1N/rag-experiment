'use client';

import { useState, useCallback, useEffect } from 'react';
import { useExperimentStore, type Chunk } from '@/stores/experiment-store';
import { splitText } from '@/lib/text-splitter';
import { SourceDocument } from './source-document';
import { ChunkCard } from './chunk-card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function TextSplittingTab() {
  const {
    sourceText,
    splitStrategy,
    setSplitStrategy,
    chunkSize,
    setChunkSize,
    overlapSize,
    setOverlapSize,
    separators,
    setSeparators,
    chunks,
    setChunks,
  } = useExperimentStore();

  const [hoveredChunk, setHoveredChunk] = useState<Chunk | null>(null);

  const handleSplit = useCallback(async () => {
    if (!sourceText.trim()) return;
    const result = await splitText(sourceText, splitStrategy, chunkSize, overlapSize, separators);
    setChunks(result);
  }, [sourceText, splitStrategy, chunkSize, overlapSize, separators, setChunks]);

  useEffect(() => {
    handleSplit();
  }, [handleSplit]);

  const avgChars = chunks.length > 0
    ? Math.round(chunks.reduce((sum, c) => sum + c.content.length, 0) / chunks.length)
    : 0;

  const withOverlap = chunks.filter(
    (c, i) => i > 0 && c.startOffset < chunks[i - 1].endOffset
  ).length;

  const avgOverlap = withOverlap > 0
    ? Math.round(
        chunks
          .filter((c, i) => i > 0 && c.startOffset < chunks[i - 1].endOffset)
          .reduce((sum, c, _, arr) => {
            const idx = chunks.indexOf(c);
            return sum + (chunks[idx - 1].endOffset - c.startOffset);
          }, 0) / withOverlap
      )
    : 0;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">텍스트 분할</h2>
        <p className="text-sm text-muted-foreground">
          문서를 의미 있는 청크로 분할하는 과정을 시각화합니다
        </p>
      </div>

      {/* Strategy descriptions */}
      <div className="mb-6 space-y-2 text-sm">
        <p>
          <strong>CharacterTextSplitter:</strong> 미리 정해진 문자 길이를 기준으로 균일하게 분할합니다. 프로토타이핑이나 리소스 제한 환경에서 최소한의 연산 부담으로 사용하기 적합합니다.
        </p>
        <p>
          <strong>RecursiveCharacterTextSplitter:</strong> 자연어 경계와 의미적 일관성을 보존하는 다단계 알고리즘입니다. 의미적 무결성이 필요한 애플리케이션에 권장됩니다.
        </p>
        <p>
          <strong>ParentDocument (Recursive):</strong> 정밀한 매칭을 위한 세분화된 청크와 풍부한 컨텍스트를 위한 상위 문서를 함께 유지하는 이중 구조입니다. 정확도와 완전성의 균형이 필요한 복잡한 애플리케이션에 최적화되어 있습니다.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <Label className="text-sm">분할 전략:</Label>
          <Select
            value={splitStrategy}
            onValueChange={(v) => setSplitStrategy(v as 'fixed' | 'recursive' | 'parent-child')}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">CharacterTextSplitter</SelectItem>
              <SelectItem value="recursive">RecursiveCharacterTextSplitter</SelectItem>
              <SelectItem value="parent-child">ParentDocument (Recursive)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm">청크 크기:</Label>
          <Input
            type="number"
            value={chunkSize}
            onChange={(e) => setChunkSize(Number(e.target.value))}
            min={50}
            max={5000}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm">오버랩 크기:</Label>
          <Input
            type="number"
            value={overlapSize}
            onChange={(e) => setOverlapSize(Number(e.target.value))}
            min={0}
            max={chunkSize - 1}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm">구분자:</Label>
          <Input
            type="text"
            value={separators.join(', ')}
            onChange={(e) =>
              setSeparators(e.target.value.split(',').map((s) => s.trim()))
            }
            className="mt-1"
            placeholder="\\n\\n, \\n, ' ', ''"
          />
        </div>
      </div>

      {/* Source + Chunks side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SourceDocument hoveredChunk={hoveredChunk} chunks={chunks} />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label className="text-sm font-medium">생성된 청크</Label>
            <span className="text-xs text-muted-foreground">
              청크에 마우스를 올리면 원본 문서에서 해당 위치가 하이라이트됩니다
            </span>
          </div>

          {/* Stats */}
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded border border-border px-3 py-1.5">
              <span className="text-xs text-muted-foreground">청크 수: </span>
              <span className="text-sm font-semibold">{chunks.length}</span>
            </div>
            <div className="rounded border border-border px-3 py-1.5">
              <span className="text-xs text-muted-foreground">평균 </span>
              <span className="text-sm font-semibold">{avgChars}</span>
              <span className="text-xs text-muted-foreground">자</span>
            </div>
            <div className="rounded border border-border px-3 py-1.5">
              <span className="text-xs text-muted-foreground">오버랩: </span>
              <span className="text-sm font-semibold">{withOverlap}</span>
            </div>
            <div className="rounded border border-border px-3 py-1.5">
              <span className="text-xs text-muted-foreground">평균 오버랩: </span>
              <span className="text-sm font-semibold">{avgOverlap}</span>
              <span className="text-xs text-muted-foreground">자</span>
            </div>
          </div>

          {/* Chunk list */}
          <div className="h-[400px] space-y-3 overflow-y-auto pr-1">
            {chunks.map((chunk) => (
              <ChunkCard
                key={chunk.id}
                chunk={chunk}
                isHovered={hoveredChunk?.id === chunk.id}
                onHover={setHoveredChunk}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
