'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { AdvancedApiKeyInput } from '@/components/advanced/api-key-input';
import { PipelineStatus } from '@/components/advanced/pipeline-status';
import { DataPrepTab } from '@/components/advanced/data-prep-tab';
import { QueryTransformTab } from '@/components/advanced/query-transform-tab';
import { RetrievalTab } from '@/components/advanced/retrieval-tab';
import { RerankingTab } from '@/components/advanced/reranking-tab';
import { GenerationTab } from '@/components/advanced/generation-tab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Shuffle, Search, ArrowRightLeft, MessageSquare } from 'lucide-react';
import { useAdvancedStore } from '@/stores/advanced-store';

const VALID_TABS = ['data-prep', 'query-transform', 'retrieval', 'reranking', 'generation'];

const TAB_TO_STEP: Record<string, number> = {
  'data-prep': 0,
  'query-transform': 1,
  'retrieval': 2,
  'reranking': 3,
  'generation': 4,
};

function AdvancedContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const defaultTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'data-prep';
  const { isEmbedded, isSqlReady, hydeDocument, multiQueries, retrievalResults, afterRerank, beforeRerank } = useAdvancedStore();

  // Compute current step based on completed state
  let completedStep = 0;
  if (isEmbedded && isSqlReady) completedStep = 1;
  if (completedStep >= 1 && (hydeDocument || multiQueries.length > 0)) completedStep = 2;
  if (completedStep >= 2 && (retrievalResults.length > 0 || beforeRerank.length > 0)) completedStep = 3;
  if (completedStep >= 3 && afterRerank.length > 0) completedStep = 4;

  return (
    <div className="flex min-h-screen flex-col">
      <Header title="삼성SDS RAG 심화" />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Page Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold">Advanced RAG 파이프라인</h1>
            <p className="text-sm text-muted-foreground">
              HyDE, Multi-Query, Text-to-SQL, Reranking 등 심화 RAG 기법을 체험합니다
            </p>
          </div>

          {/* Pipeline Status */}
          <div className="mb-4">
            <PipelineStatus
              currentStep={completedStep}
              activeStep={TAB_TO_STEP[defaultTab]}
            />
          </div>

          {/* API Key */}
          <div className="mb-6">
            <AdvancedApiKeyInput />
          </div>

          {/* Tabs */}
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-5">
              <TabsTrigger value="data-prep" className="gap-1.5 text-xs sm:text-sm">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">데이터 준비</span>
                <span className="sm:hidden">준비</span>
              </TabsTrigger>
              <TabsTrigger value="query-transform" className="gap-1.5 text-xs sm:text-sm">
                <Shuffle className="h-4 w-4" />
                <span className="hidden sm:inline">질의 변환</span>
                <span className="sm:hidden">변환</span>
              </TabsTrigger>
              <TabsTrigger value="retrieval" className="gap-1.5 text-xs sm:text-sm">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">검색</span>
                <span className="sm:hidden">검색</span>
              </TabsTrigger>
              <TabsTrigger value="reranking" className="gap-1.5 text-xs sm:text-sm">
                <ArrowRightLeft className="h-4 w-4" />
                <span className="hidden sm:inline">리랭킹</span>
                <span className="sm:hidden">리랭킹</span>
              </TabsTrigger>
              <TabsTrigger value="generation" className="gap-1.5 text-xs sm:text-sm">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">응답 생성</span>
                <span className="sm:hidden">생성</span>
              </TabsTrigger>
            </TabsList>

            <div className="rounded-lg border border-border p-6">
              <TabsContent value="data-prep" className="mt-0">
                <DataPrepTab />
              </TabsContent>
              <TabsContent value="query-transform" className="mt-0">
                <QueryTransformTab />
              </TabsContent>
              <TabsContent value="retrieval" className="mt-0">
                <RetrievalTab />
              </TabsContent>
              <TabsContent value="reranking" className="mt-0">
                <RerankingTab />
              </TabsContent>
              <TabsContent value="generation" className="mt-0">
                <GenerationTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default function AdvancedPage() {
  return (
    <Suspense>
      <AdvancedContent />
    </Suspense>
  );
}
