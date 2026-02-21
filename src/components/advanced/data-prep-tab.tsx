'use client';

import { useState } from 'react';
import { useAdvancedStore } from '@/stores/advanced-store';
import { SAMPLE_DOCUMENTS } from '@/lib/sample-data';
import { splitText } from '@/lib/text-splitter';
import { createEmbedding } from '@/lib/openai';
import { createIndex, bulkIndex } from '@/lib/opensearch';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Database, FileText, Loader2 } from 'lucide-react';

export function DataPrepTab() {
  const {
    openaiApiKey,
    sessionId,
    isEmbedding,
    setIsEmbedding,
    isEmbedded,
    setIsEmbedded,
    embeddingProgress,
    setEmbeddingProgress,
    setIndexName,
    setDocumentCount,
    setChunkCount,
    embeddingModel,
    embeddingDimension,
    documentCount,
    chunkCount,
    indexName,
    isSqlReady,
    setIsSqlReady,
    isSettingUpSql,
    setIsSettingUpSql,
    sqlTables,
    setSqlTables,
    sqlRowCounts,
    setSqlRowCounts,
  } = useAdvancedStore();

  const [error, setError] = useState<string | null>(null);

  const handleSetupAll = async () => {
    if (!openaiApiKey) {
      setError('OpenAI API 키를 먼저 입력해주세요');
      return;
    }

    setError(null);

    // Run both in parallel
    await Promise.all([handleEmbedDocuments(), handleSetupSql()]);
  };

  const handleEmbedDocuments = async () => {
    if (!openaiApiKey) return;

    setIsEmbedding(true);
    setEmbeddingProgress(0);

    try {
      // Split all documents into chunks
      const allChunks: { id: string; content: string }[] = [];
      for (let i = 0; i < SAMPLE_DOCUMENTS.length; i++) {
        const doc = SAMPLE_DOCUMENTS[i];
        const chunks = await splitText(doc.content, 'recursive', 300, 50, ['\\n\\n', '\\n', ' ', '']);
        for (const chunk of chunks) {
          allChunks.push({
            id: `${doc.id}-${chunk.index}`,
            content: chunk.content,
          });
        }
        setEmbeddingProgress(Math.round(((i + 1) / SAMPLE_DOCUMENTS.length) * 20));
      }

      setDocumentCount(SAMPLE_DOCUMENTS.length);
      setChunkCount(allChunks.length);

      // Embed all chunks
      const allEmbeddings: number[][] = [];
      const batchSize = 20;
      for (let i = 0; i < allChunks.length; i += batchSize) {
        const batch = allChunks.slice(i, i + batchSize);
        const embeddings = await createEmbedding(
          batch.map((c) => c.content),
          openaiApiKey,
          embeddingModel,
          embeddingDimension
        );
        allEmbeddings.push(...embeddings);
        setEmbeddingProgress(20 + Math.round(((i + batch.length) / allChunks.length) * 50));
      }

      // Create index and bulk insert
      const newIndexName = `adv-rag-${sessionId}-${Date.now()}`;
      await createIndex(newIndexName, embeddingDimension);
      setEmbeddingProgress(80);

      const documents = allChunks.map((chunk, i) => ({
        id: chunk.id,
        content: chunk.content,
        embedding: allEmbeddings[i],
      }));
      await bulkIndex(newIndexName, documents);

      setIndexName(newIndexName);
      setEmbeddingProgress(100);
      setIsEmbedded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Embedding failed');
    } finally {
      setIsEmbedding(false);
    }
  };

  const handleSetupSql = async () => {
    setIsSettingUpSql(true);
    try {
      const response = await fetch('/api/advanced/setup-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setup' }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'SQL setup failed');
      }

      const data = await response.json();
      setSqlTables(data.tables);
      setSqlRowCounts(data.rowCounts);
      setIsSqlReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SQL setup failed');
    } finally {
      setIsSettingUpSql(false);
    }
  };

  if (!openaiApiKey) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        데이터 준비를 시작하려면 OpenAI API 키를 먼저 입력해주세요.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">데이터 준비</h2>
          <p className="text-sm text-muted-foreground">
            비정형 문서를 벡터 인덱싱하고, 정형 데이터를 SQL 테이블로 구축합니다
          </p>
        </div>
        <Button
          onClick={handleSetupAll}
          disabled={isEmbedding || isSettingUpSql || (isEmbedded && isSqlReady)}
        >
          {isEmbedding || isSettingUpSql ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              준비 중...
            </>
          ) : isEmbedded && isSqlReady ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              준비 완료
            </>
          ) : (
            '데이터 준비 시작'
          )}
        </Button>
      </div>

      {/* Progress */}
      {isEmbedding && (
        <div className="mb-6">
          <Progress value={embeddingProgress} className="h-2" />
          <p className="mt-1 text-xs text-muted-foreground">
            {embeddingProgress < 20
              ? '문서 분할 중...'
              : embeddingProgress < 70
              ? '청크 임베딩 중...'
              : embeddingProgress < 80
              ? 'OpenSearch 인덱스 생성 중...'
              : embeddingProgress < 100
              ? '문서 인덱싱 중...'
              : '완료!'}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Two columns: Documents + SQL */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Documents section */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <h3 className="text-sm font-medium">비정형 문서 (벡터 인덱싱)</h3>
            {isEmbedded && (
              <Badge variant="outline" className="text-green-700 border-green-300">
                완료
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            {SAMPLE_DOCUMENTS.map((doc) => (
              <div key={doc.id} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium">{doc.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {doc.content}
                </p>
              </div>
            ))}
          </div>
          {isEmbedded && (
            <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              {documentCount}개 문서 → {chunkCount}개 청크 → 인덱스:{' '}
              <code className="font-mono text-xs">{indexName}</code>
            </div>
          )}
        </div>

        {/* SQL section */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Database className="h-4 w-4" />
            <h3 className="text-sm font-medium">정형 데이터 (SQL 테이블)</h3>
            {isSqlReady && (
              <Badge variant="outline" className="text-green-700 border-green-300">
                완료
              </Badge>
            )}
          </div>
          {isSqlReady ? (
            <div className="space-y-2">
              {sqlTables.map((table) => (
                <div key={table} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium font-mono">{table}</p>
                    <Badge variant="secondary" className="text-xs">
                      {sqlRowCounts[table] || 0}행
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {table === 'financial_results' && '연도별, 분기별, 사업부별 매출 및 영업이익'}
                    {table === 'cloud_metrics' && '클라우드 서비스별 매출, 성장률, 고객 수'}
                    {table === 'employees' && '부서별, 지역별 인원 현황'}
                    {table === 'projects' && '주요 프로젝트 정보 및 상태'}
                  </p>
                </div>
              ))}
            </div>
          ) : isSettingUpSql ? (
            <div className="flex items-center gap-2 rounded-lg border border-border p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              SQL 테이블 생성 중...
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              &quot;데이터 준비 시작&quot; 버튼을 클릭하면 SQL 테이블이 생성됩니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
