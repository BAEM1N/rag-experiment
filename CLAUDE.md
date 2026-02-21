# CLAUDE.md — sds

## 프로젝트 개요

SDS 관련 Next.js 웹 애플리케이션.

## 서버 운영

- **포트**: 8380
- **PM2 name**: `sds`
- **실행 방식**: `npm run start` (`next start -p 8380`)

```bash
# 코드 변경 후
npm run build && pm2 restart sds

# 로그 확인
pm2 logs sds
```

## 기술 스택

- Next.js 16.x / React 19 / TypeScript
- Tailwind CSS v4, shadcn/ui, Radix UI, Lucide Icons
- **LangChain**: `@langchain/openai`, `@langchain/textsplitters` (OpenAI 연동)
- `sql.js`: 브라우저 내 SQLite
- `umap-js`: 차원 축소 시각화
- `recharts`: 차트
- `zustand`: 클라이언트 상태 관리

## 디렉토리 구조

```
src/
├── app/          # Next.js App Router 페이지
├── components/   # 공통 컴포넌트
├── lib/          # 유틸리티, 헬퍼
├── stores/       # Zustand 스토어
└── types/        # TypeScript 타입 정의
```
