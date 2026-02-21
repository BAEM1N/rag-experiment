import Link from 'next/link';
import { ArrowRight, BookOpen, GraduationCap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="grid w-full max-w-5xl grid-cols-1 gap-10 sm:grid-cols-2">
        {/* 입문 카드 */}
        <Link
          href="/ragbasic"
          className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-10 transition-all hover:border-foreground/20 hover:shadow-lg"
        >
          <div>
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
              <BookOpen className="h-8 w-8 text-foreground" />
            </div>
            <h2 className="mb-3 text-3xl font-bold">입문</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Naive RAG 파이프라인의 5단계를 인터랙티브 시각화로 직접 체험하고 학습합니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['텍스트 분할', '벡터 임베딩', '키워드 검색', '하이브리드 검색', '응답 생성'].map((step) => (
                <span key={step} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  {step}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-10 flex items-center gap-2 text-sm font-medium text-foreground">
            시작하기 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* 심화 카드 */}
        <Link
          href="/ragadvanced"
          className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-10 transition-all hover:border-foreground/20 hover:shadow-lg"
        >
          <div>
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
              <GraduationCap className="h-8 w-8 text-foreground" />
            </div>
            <h2 className="mb-3 text-3xl font-bold">심화</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Advanced RAG 파이프라인으로 HyDE, Multi-Query, Text-to-SQL, Re-ranking 기법을 다룹니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['HyDE', 'Multi-Query', 'Text-to-SQL', 'Re-ranking', '응답 생성'].map((step) => (
                <span key={step} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  {step}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-10 flex items-center gap-2 text-sm font-medium text-foreground">
            시작하기 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}
