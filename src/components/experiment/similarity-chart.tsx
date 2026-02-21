'use client';

import { useMemo, useState } from 'react';
import {
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { computeUMAP, cosineSimilarity } from '@/lib/umap';

interface SimilarityChartProps {
  embeddings: number[][];
  questionEmbedding?: number[];
  nearestIndices?: number[];
}

export function SimilarityChart({
  embeddings,
  questionEmbedding,
  nearestIndices = [],
}: SimilarityChartProps) {
  const [showHeatmap, setShowHeatmap] = useState(false);

  // UMAP scatter data
  const { chunkData, questionData } = useMemo(() => {
    if (embeddings.length === 0) return { chunkData: [], questionData: [] };

    const { points, questionPoint } = computeUMAP(
      embeddings,
      questionEmbedding && questionEmbedding.length > 0 ? questionEmbedding : undefined
    );

    const chunkData = points.map((p, i) => ({
      x: p[0],
      y: p[1],
      name: `청크 ${i + 1}`,
      isNearest: nearestIndices.includes(i),
    }));

    const questionData = questionPoint
      ? [{ x: questionPoint[0], y: questionPoint[1], name: '질문' }]
      : [];

    return { chunkData, questionData };
  }, [embeddings, questionEmbedding, nearestIndices]);

  // Cosine similarity bar data
  const barData = useMemo(() => {
    if (!questionEmbedding || questionEmbedding.length === 0 || embeddings.length === 0) return [];
    return embeddings
      .map((emb, i) => ({
        name: `청크 ${i + 1}`,
        index: i,
        similarity: parseFloat(cosineSimilarity(emb, questionEmbedding).toFixed(4)),
        isNearest: nearestIndices.includes(i),
      }))
      .sort((a, b) => b.similarity - a.similarity);
  }, [embeddings, questionEmbedding, nearestIndices]);

  // Pairwise heatmap data
  const heatmapData = useMemo(() => {
    if (!showHeatmap || embeddings.length === 0) return [];
    const matrix: { row: number; col: number; similarity: number }[] = [];
    for (let i = 0; i < embeddings.length; i++) {
      for (let j = 0; j < embeddings.length; j++) {
        matrix.push({
          row: i,
          col: j,
          similarity: i === j ? 1 : parseFloat(cosineSimilarity(embeddings[i], embeddings[j]).toFixed(4)),
        });
      }
    }
    return matrix;
  }, [embeddings, showHeatmap]);

  if (embeddings.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        청크를 임베딩하면 유사도 시각화를 확인할 수 있습니다
      </div>
    );
  }

  const nearestData = chunkData.filter((d) => d.isNearest);
  const otherData = chunkData.filter((d) => !d.isNearest);

  const getBarColor = (similarity: number, isNearest: boolean) => {
    if (isNearest) return '#22c55e';
    if (similarity >= 0.8) return '#4ade80';
    if (similarity >= 0.6) return '#86efac';
    if (similarity >= 0.4) return '#fbbf24';
    return '#d1d5db';
  };

  const getHeatColor = (similarity: number) => {
    if (similarity >= 0.95) return '#14532d';
    if (similarity >= 0.85) return '#166534';
    if (similarity >= 0.75) return '#15803d';
    if (similarity >= 0.65) return '#16a34a';
    if (similarity >= 0.55) return '#22c55e';
    if (similarity >= 0.45) return '#4ade80';
    if (similarity >= 0.35) return '#86efac';
    if (similarity >= 0.25) return '#bbf7d0';
    return '#f0fdf4';
  };

  const n = embeddings.length;
  const cellSize = Math.min(36, Math.max(14, 360 / n));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">임베딩 유사도</h3>
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`rounded-md border border-border px-2 py-1 text-xs transition-colors ${showHeatmap ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
        >
          청크 간 히트맵
        </button>
      </div>

      {/* Two-column: UMAP (left) + Cosine Similarity (right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: UMAP Scatter */}
        <div>
          <p className="mb-2 text-xs text-muted-foreground">
            UMAP 산점도 — 고차원 벡터를 2D로 축소한 근사 표현
          </p>
          <div className="h-[280px] rounded-lg border border-border p-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" dataKey="x" tick={false} />
                <YAxis type="number" dataKey="y" tick={false} />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.[0]) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="rounded border border-border bg-background p-2 text-xs shadow-md">
                        {data.name}
                      </div>
                    );
                  }}
                />
                {questionData.length > 0 &&
                  nearestData.map((nd, i) => (
                    <ReferenceLine
                      key={i}
                      segment={[
                        { x: questionData[0].x, y: questionData[0].y },
                        { x: nd.x, y: nd.y },
                      ]}
                      stroke="#999"
                      strokeDasharray="3 3"
                      strokeWidth={1}
                    />
                  ))}
                <Scatter name="Chunks" data={otherData} fill="#22c55e" opacity={0.7} />
                <Scatter name="Nearest" data={nearestData} fill="#22c55e" opacity={1} />
                <Scatter name="Question" data={questionData} fill="#ef4444" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500" /> 청크
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" /> 질문
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 border border-dashed border-gray-400" /> 최근접
            </div>
          </div>
        </div>

        {/* Right: Cosine Similarity Bar */}
        <div>
          <p className="mb-2 text-xs text-muted-foreground">
            코사인 유사도 — 질문과 각 청크 간 정확한 유사도 수치
          </p>
          {barData.length > 0 ? (
            <>
              <div className="h-[280px] rounded-lg border border-border p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 50, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
                    <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={48} />
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload?.[0]) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="rounded border border-border bg-background p-2 text-xs shadow-md">
                            <p className="font-medium">{data.name}</p>
                            <p>코사인 유사도: <span className="font-mono font-semibold">{data.similarity}</span></p>
                            {data.isNearest && <p className="text-green-600">Top-K 매칭</p>}
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="similarity" radius={[0, 4, 4, 0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={getBarColor(entry.similarity, entry.isNearest)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 rounded bg-green-500" /> Top-K
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 rounded bg-yellow-400" /> 중간
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 rounded bg-gray-300" /> 낮음
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              질문을 입력하면 유사도를 확인할 수 있습니다
            </div>
          )}
        </div>
      </div>

      {/* Heatmap (expandable) */}
      {showHeatmap && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-muted-foreground">
            청크 간 코사인 유사도 행렬 — 색이 진할수록 의미적으로 유사
          </p>
          <div className="overflow-x-auto rounded-lg border border-border p-3">
            <div className="inline-block">
              <div className="flex" style={{ paddingLeft: cellSize + 4 }}>
                {Array.from({ length: n }, (_, j) => (
                  <div
                    key={j}
                    className="flex items-end justify-center text-[10px] text-muted-foreground"
                    style={{ width: cellSize, height: 28 }}
                  >
                    {j + 1}
                  </div>
                ))}
              </div>
              {Array.from({ length: n }, (_, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className="flex items-center justify-end pr-1 text-[10px] text-muted-foreground"
                    style={{ width: cellSize + 4 }}
                  >
                    {i + 1}
                  </div>
                  {Array.from({ length: n }, (_, j) => {
                    const cell = heatmapData[i * n + j];
                    return (
                      <div
                        key={j}
                        className="group relative border border-background"
                        style={{
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: cell ? getHeatColor(cell.similarity) : '#f0fdf4',
                        }}
                        title={`청크 ${i + 1} ↔ 청크 ${j + 1}: ${cell?.similarity ?? ''}`}
                      >
                        {cellSize >= 28 && cell && (
                          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono opacity-0 group-hover:opacity-100">
                            {cell.similarity.toFixed(2)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground">
                <span>낮음</span>
                <div className="flex">
                  {['#f0fdf4', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'].map((c) => (
                    <div key={c} className="h-3 w-4" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span>높음</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
