import { create } from 'zustand';

export interface Chunk {
  id: string;
  content: string;
  index: number;
  startOffset: number;
  endOffset: number;
  parentId?: string;
}

export interface SearchResult {
  id: string;
  content: string;
  score: number;
  highlight?: string[];
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem('rag-session-id');
  if (!id) {
    id = Math.random().toString(36).slice(2, 8);
    localStorage.setItem('rag-session-id', id);
  }
  return id;
}

interface ExperimentStore {
  // Session
  sessionId: string;

  // API Key
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;

  // Text Splitting
  sourceText: string;
  setSourceText: (text: string) => void;
  splitStrategy: 'fixed' | 'recursive' | 'parent-child';
  setSplitStrategy: (strategy: 'fixed' | 'recursive' | 'parent-child') => void;
  chunkSize: number;
  setChunkSize: (size: number) => void;
  overlapSize: number;
  setOverlapSize: (size: number) => void;
  separators: string[];
  setSeparators: (seps: string[]) => void;
  chunks: Chunk[];
  setChunks: (chunks: Chunk[]) => void;

  // Embedding
  embeddingModel: string;
  setEmbeddingModel: (model: string) => void;
  embeddingDimension: number;
  setEmbeddingDimension: (dim: number) => void;
  embeddings: number[][];
  setEmbeddings: (embeddings: number[][]) => void;
  isEmbedding: boolean;
  setIsEmbedding: (val: boolean) => void;
  isEmbedded: boolean;
  setIsEmbedded: (val: boolean) => void;
  embeddingProgress: number;
  setEmbeddingProgress: (val: number) => void;
  indexName: string;
  setIndexName: (name: string) => void;

  // Search - question
  questionText: string;
  setQuestionText: (text: string) => void;
  questionEmbedding: number[];
  setQuestionEmbedding: (embedding: number[]) => void;

  // Search Results
  topK: number;
  setTopK: (k: number) => void;
  knnResults: SearchResult[];
  setKnnResults: (results: SearchResult[]) => void;
  keywordResults: SearchResult[];
  setKeywordResults: (results: SearchResult[]) => void;
  hybridResults: SearchResult[];
  setHybridResults: (results: SearchResult[]) => void;

  // Hybrid search weights
  vectorWeight: number;
  setVectorWeight: (w: number) => void;
  textWeight: number;
  setTextWeight: (w: number) => void;

  // Generation
  chatModel: string;
  setChatModel: (model: string) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  maxTokens: number;
  setMaxTokens: (tokens: number) => void;
  systemMessage: string;
  setSystemMessage: (msg: string) => void;
  selectedSearchTab: 'knn' | 'keyword' | 'hybrid';
  setSelectedSearchTab: (tab: 'knn' | 'keyword' | 'hybrid') => void;
  generatedResponse: string;
  setGeneratedResponse: (resp: string) => void;
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;
}

export interface SampleText {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  content: string;
}

export const SAMPLE_TEXTS: SampleText[] = [
  {
    id: 'sds-results',
    title: '삼성SDS 2025년 실적 발표',
    source: '삼성SDS 뉴스룸',
    sourceUrl: 'https://www.samsungsds.com/kr/news/results-260122.html',
    content: `삼성SDS 2025년 경영실적 발표

삼성SDS가 2026년 1월 22일 2025년 잠정 경영실적을 발표했다. 연간 매출 13조 9,300억 원, 영업이익 9,571억 원을 기록하며 전년 대비 각각 0.7%, 5.0% 성장했다.

4분기 실적
4분기 매출은 3조 5,400억 원으로 전년 동기 대비 2.9% 감소했으나, 영업이익은 2,261억 원으로 6.9% 증가했다.

IT서비스 부문
IT서비스 부문은 연간 매출 6조 5,400억 원을 기록하며 전년 대비 2.2% 성장했다. 클라우드 사업이 매출 2조 6,800억 원으로 15.4% 성장하며 성장을 주도했다. 주요 성장 동력은 삼성 클라우드 플랫폼(SCP)을 통한 생성형 AI 서비스 확대, GPU-as-a-Service(GPUaaS), 고성능 컴퓨팅 확장, 클라우드 네트워크 서비스 등이다. 매니지드 서비스 부문은 금융권 클라우드 전환과 공공부문 AI 서비스 수주가 실적에 기여했다.

물류 부문
물류 부문은 연간 매출 7조 3,900억 원으로 해상 운임 하락 지속으로 전년 대비 0.5% 감소했으며, 영업이익은 1,300억 원으로 6.2% 줄었다. 디지털 물류 플랫폼 첼로 스퀘어(Cello Square)는 등록 기업 수 24,625개로 27% 성장했다.

2026년 전략
삼성SDS는 AI 인프라, 플랫폼, 솔루션 역량을 확대할 계획이다. NVIDIA B300 기반 GPUaaS 상품 출시와 재해복구(DR) 사업을 추진한다. 최근 국내 최초로 OpenAI의 ChatGPT Enterprise 리셀러 파트너십을 확보했다.

배당
이사회는 주당 배당금을 전년 대비 10% 인상한 3,190원으로 의결했으며, 고배당 기업 요건을 충족했다.

주요 재무 지표
- 연간 매출: 13조 9,300억 원 (전년 대비 +0.7%)
- 연간 영업이익: 9,571억 원 (전년 대비 +5.0%)
- 클라우드 매출: 2조 6,800억 원 (전년 대비 +15.4%)
- 첼로 스퀘어 등록 기업: 24,625개 (전년 대비 +27%)
- 주당 배당금: 3,190원 (전년 대비 +10%)
- 임직원 수: 약 25,000명
- 글로벌 거점: 40개국 57개 법인·지사`,
  },
  {
    id: 'sds-overview',
    title: '삼성SDS 회사 개요',
    source: '삼성SDS 기업소개',
    sourceUrl: 'https://www.samsungsds.com/kr/company/overview/about_comp_over.html',
    content: `삼성SDS 회사 개요

삼성SDS는 데이터와 컴퓨팅 기술 리더로서, 생성형 AI와 클라우드 기반 IT서비스 및 디지털 물류 솔루션을 제공한다. 40년간 축적한 산업별 전문성을 기반으로 맞춤형 삼성 클라우드 플랫폼과 올인원 매니지드 서비스를 제공하며, 고객 최적화된 생성형 AI 기술과 클라우드 환경을 구현한다.

기본 정보
- IT 경험: 40년
- 매출: 13.8조 원 (2024년 기준)
- 임직원 수: 25,536명
- 글로벌 거점: 40개국 57개 법인·지사

클라우드 역량
삼성SDS는 국내 매니지드 클라우드 서비스 시장 점유율 1위를 보유하고 있으며, 국내 클라우드 서비스 제공업체 중 1위로 평가받고 있다. IDC 마켓스케이프에서 글로벌 클라우드 프로페셔널 서비스와 퍼블릭 클라우드 IaaS 부문에서 인정받았다.

생성형 AI 기반 클라우드 서비스
컨설팅부터 매니지드 운영까지 엔드투엔드 서비스를 제공한다. 삼성 클라우드 플랫폼(SCP), 클라우드 매니지드 서비스, 그리고 FabriX, Brity Copilot, Brity Automation 등 기업 하이퍼오토메이션 솔루션을 통해 고객의 디지털 전환을 지원한다.

주요 솔루션
- FabriX: 생성형 AI 개발 플랫폼으로, 기업 맞춤형 AI 모델 구축 및 배포를 지원한다.
- Brity Copilot: AI 업무 보조 도구로, 문서 작성·요약·분석 등 업무 생산성을 향상시킨다.
- Brity Automation: RPA 기반 업무 자동화 플랫폼으로, 반복 업무를 자동화한다.
- SCP(Samsung Cloud Platform): 삼성SDS의 클라우드 플랫폼으로, 멀티 클라우드 환경을 지원한다.
- GPUaaS: GPU 자원을 서비스 형태로 제공하여 AI 학습 및 추론 워크로드를 지원한다.

디지털 물류 서비스
첼로 스퀘어(Cello Square) 플랫폼을 통해 공급망 계획부터 실행까지 통합 글로벌 물류 서비스를 제공한다. 디지털 포워딩 기능을 포함한 종합 물류 솔루션으로, AI 기반 수요 예측, 최적 경로 추천, 실시간 화물 추적 등의 기능을 갖추고 있다.

글로벌 인정
가트너(Gartner), IDC, 프로스트앤설리번(Frost & Sullivan) 등 글로벌 리서치 기관으로부터 매니지드 클라우드 서비스, 클라우드 보안, AI 부문의 전문 클라우드 서비스 제공업체로 평가받고 있다.`,
  },
  {
    id: 'sds-devops',
    title: 'AI 기반 데브옵스 문서 자동화',
    source: '삼성SDS 인사이트',
    sourceUrl: 'https://www.samsungsds.com/kr/insights/ai-powered-devops-document-automation.html',
    content: `AI 기반 데브옵스 문서 자동화

데브옵스 팀은 문서화에 대해 복잡한 감정을 가지고 있다. 개발자들은 문서화되지 않은 코드를 유지보수하기 꺼리며, 아키텍처 다이어그램은 실제 구현과 맞지 않는 경우가 많다. 생성형 AI를 활용하면 기술 문서 작성 시간을 획기적으로 단축하고, 개발자가 핵심 업무에 집중할 수 있도록 지원할 수 있다.

생성형 AI 문서 자동화의 3가지 이점
1. 시간 절약 및 효율성: AI를 통해 기술 문서 작성 시간을 획기적으로 단축하고 개발자가 핵심 업무에 집중하도록 지원한다.
2. 정확성 유지: AI 기반 자동화는 문서의 일관성을 유지하고, 코드 변경 사항을 즉시 반영하여 최신 정보를 제공한다.
3. 데브옵스 문화 강화: 자동화된 문서화 시스템은 개발, 운영, 보안 팀 간의 협업을 촉진한다.

기술 문서의 주요 독자
- 새로 합류한 개발자: 온보딩 시 시스템 구조와 코드 베이스를 빠르게 이해하기 위해 문서를 참조한다.
- 외부 개발팀: API 연동이나 시스템 통합 시 인터페이스 명세서를 필요로 한다.
- 아키텍트 및 보안 전문가: 시스템의 전체 구조와 보안 설계를 검토한다.
- 데이터 엔지니어: 데이터 파이프라인과 스키마 정보를 확인한다.
- 제품 관리자: 기능 명세와 기술적 제약 사항을 파악한다.
- 규정 준수 감사자: 보안 정책과 컴플라이언스 요건 충족 여부를 확인한다.
- AI 코딩 어시스턴트: 코드 컨텍스트를 이해하고 정확한 제안을 하기 위해 문서를 학습한다.

5가지 핵심 문서화 영역

1. 기능 작동 방식 문서화
Confluence, Notion 같은 도구를 활용하여 요구사항, 기술 설계, 사용자 스토리를 문서화한다. AI는 코드 변경 사항을 감지하고 관련 문서를 자동으로 업데이트할 수 있다.

2. API 및 데이터 문서화
AI가 자동으로 오픈API 명세를 생성·유지해 엔드포인트, 페이로드, 인증 방식을 정확히 반영한다. Postman, Swagger, Alation 등의 도구가 이 과정을 지원한다. 데이터 카탈로그와 스키마 문서도 자동 생성할 수 있다.

3. 런타임 및 표준 운영 절차(SOP)
AI 기반 로그 분석 도구(Datadog, Splunk 등)를 활용하여 시스템과 함께 진화하는 살아 있는 문서를 만든다. 인시던트 대응 절차, 배포 체크리스트, 롤백 가이드 등이 자동으로 최신 상태를 유지한다.

4. AI 에이전트 학습용 문서
AI가 코드가 무엇을 하는가뿐만 아니라 왜 그렇게 작성됐는가를 이해할 수 있도록 설계 결정 배경과 아키텍처 결정 기록(ADR)을 문서화한다. 이는 AI 코딩 어시스턴트의 정확도를 높이는 데 기여한다.

5. 레거시 애플리케이션 문서화
AI는 방대한 양의 자료를 요약하고 메타데이터를 분석하여 미문서화된 시스템을 기록한다. 코드 분석을 통해 의존성 맵, 데이터 흐름도, 비즈니스 로직 요약을 자동 생성할 수 있다.

도입 시 고려사항
- AI가 생성한 문서는 반드시 전문가의 검토를 거쳐야 한다.
- 독자를 염두에 둔 적정 수준의 문서화가 효과적이다.
- 모든 문서는 인간 독자와 LLM 학습용 두 가지 목적으로 작성되어야 한다.
- 기존 CI/CD 파이프라인에 문서 자동화를 통합하는 것이 권장된다.`,
  },
];

const DEFAULT_SOURCE_TEXT = SAMPLE_TEXTS[0].content;

const DEFAULT_SYSTEM_MESSAGE = `당신은 유용한 AI 어시스턴트입니다. 아래 제공된 컨텍스트를 활용하여 사용자의 질문에 답변하세요.
답을 모르면 모른다고 솔직하게 말하세요. 답변을 지어내지 마세요.`;

export const useExperimentStore = create<ExperimentStore>((set) => ({
  // Session
  sessionId: getSessionId(),

  // API Key
  openaiApiKey: '',
  setOpenaiApiKey: (key) => set({ openaiApiKey: key }),

  // Text Splitting
  sourceText: DEFAULT_SOURCE_TEXT,
  setSourceText: (text) => set({ sourceText: text }),
  splitStrategy: 'recursive',
  setSplitStrategy: (strategy) => set({ splitStrategy: strategy }),
  chunkSize: 500,
  setChunkSize: (size) => set({ chunkSize: size }),
  overlapSize: 50,
  setOverlapSize: (size) => set({ overlapSize: size }),
  separators: ['\\n\\n', '\\n', ' ', ''],
  setSeparators: (seps) => set({ separators: seps }),
  chunks: [],
  setChunks: (chunks) => set({ chunks }),

  // Embedding
  embeddingModel: 'text-embedding-3-small',
  setEmbeddingModel: (model) => set({ embeddingModel: model }),
  embeddingDimension: 1024,
  setEmbeddingDimension: (dim) => set({ embeddingDimension: dim }),
  embeddings: [],
  setEmbeddings: (embeddings) => set({ embeddings }),
  isEmbedding: false,
  setIsEmbedding: (val) => set({ isEmbedding: val }),
  isEmbedded: false,
  setIsEmbedded: (val) => set({ isEmbedded: val }),
  embeddingProgress: 0,
  setEmbeddingProgress: (val) => set({ embeddingProgress: val }),
  indexName: '',
  setIndexName: (name) => set({ indexName: name }),

  // Search
  questionText: '',
  setQuestionText: (text) => set({ questionText: text }),
  questionEmbedding: [],
  setQuestionEmbedding: (embedding) => set({ questionEmbedding: embedding }),

  topK: 5,
  setTopK: (k) => set({ topK: k }),
  knnResults: [],
  setKnnResults: (results) => set({ knnResults: results }),
  keywordResults: [],
  setKeywordResults: (results) => set({ keywordResults: results }),
  hybridResults: [],
  setHybridResults: (results) => set({ hybridResults: results }),

  vectorWeight: 0.7,
  setVectorWeight: (w) => set({ vectorWeight: w }),
  textWeight: 0.3,
  setTextWeight: (w) => set({ textWeight: w }),

  // Generation
  chatModel: 'gpt-4.1-mini',
  setChatModel: (model) => set({ chatModel: model }),
  temperature: 0.3,
  setTemperature: (temp) => set({ temperature: temp }),
  maxTokens: 1000,
  setMaxTokens: (tokens) => set({ maxTokens: tokens }),
  systemMessage: DEFAULT_SYSTEM_MESSAGE,
  setSystemMessage: (msg) => set({ systemMessage: msg }),
  selectedSearchTab: 'knn',
  setSelectedSearchTab: (tab) => set({ selectedSearchTab: tab }),
  generatedResponse: '',
  setGeneratedResponse: (resp) => set({ generatedResponse: resp }),
  isGenerating: false,
  setIsGenerating: (val) => set({ isGenerating: val }),
}));
