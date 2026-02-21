'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { ApiKeyInput } from '@/components/experiment/api-key-input';
import { TextSplittingTab } from '@/components/experiment/text-splitting-tab';
import { EmbeddingTab } from '@/components/experiment/embedding-tab';
import { KeywordSearchTab } from '@/components/experiment/keyword-search-tab';
import { HybridSearchTab } from '@/components/experiment/hybrid-search-tab';
import { GenerationTab } from '@/components/experiment/generation-tab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SplitSquareHorizontal, Braces, Search, Combine, MessageSquare } from 'lucide-react';

const VALID_TABS = ['splitting', 'embedding', 'keyword', 'hybrid', 'generation'];

function ExperimentContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const defaultTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'splitting';
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Naive RAG 파이프라인</h1>
            <p className="text-sm text-muted-foreground">
              Naive RAG 파이프라인의 각 단계를 인터랙티브 시각화로 체험해보세요
            </p>
          </div>

          {/* API Key */}
          <div className="mb-6">
            <ApiKeyInput />
          </div>

          {/* Tabs */}
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-5">
              <TabsTrigger value="splitting" className="gap-1.5 text-xs sm:text-sm">
                <SplitSquareHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">텍스트 분할</span>
                <span className="sm:hidden">분할</span>
              </TabsTrigger>
              <TabsTrigger value="embedding" className="gap-1.5 text-xs sm:text-sm">
                <Braces className="h-4 w-4" />
                <span className="hidden sm:inline">벡터 임베딩</span>
                <span className="sm:hidden">임베딩</span>
              </TabsTrigger>
              <TabsTrigger value="keyword" className="gap-1.5 text-xs sm:text-sm">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">키워드 검색</span>
                <span className="sm:hidden">키워드</span>
              </TabsTrigger>
              <TabsTrigger value="hybrid" className="gap-1.5 text-xs sm:text-sm">
                <Combine className="h-4 w-4" />
                <span className="hidden sm:inline">하이브리드 검색</span>
                <span className="sm:hidden">하이브리드</span>
              </TabsTrigger>
              <TabsTrigger value="generation" className="gap-1.5 text-xs sm:text-sm">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">응답 생성</span>
                <span className="sm:hidden">생성</span>
              </TabsTrigger>
            </TabsList>

            <div className="rounded-lg border border-border p-6">
              <TabsContent value="splitting" className="mt-0">
                <TextSplittingTab />
              </TabsContent>
              <TabsContent value="embedding" className="mt-0">
                <EmbeddingTab />
              </TabsContent>
              <TabsContent value="keyword" className="mt-0">
                <KeywordSearchTab />
              </TabsContent>
              <TabsContent value="hybrid" className="mt-0">
                <HybridSearchTab />
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

export default function ExperimentPage() {
  return (
    <Suspense>
      <ExperimentContent />
    </Suspense>
  );
}
