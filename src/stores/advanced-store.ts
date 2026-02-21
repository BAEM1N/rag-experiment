import { create } from 'zustand';

export interface SearchResult {
  id: string;
  content: string;
  score: number;
  highlight?: string[];
}

export interface SqlResult {
  columns: string[];
  rows: Record<string, unknown>[];
  query: string;
  narrative: string;
}

export interface RankedResult {
  content: string;
  source: 'retrieval' | 'sql';
  originalRank: number;
  newRank?: number;
  relevanceScore?: number;
  reason?: string;
}

function getAdvancedSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem('rag-advanced-session-id');
  if (!id) {
    id = Math.random().toString(36).slice(2, 8);
    localStorage.setItem('rag-advanced-session-id', id);
  }
  return id;
}

interface AdvancedStore {
  // Session
  sessionId: string;

  // API Key
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;

  // ── Global Model Config ──
  embeddingModel: string;
  setEmbeddingModel: (model: string) => void;
  embeddingDimension: number;
  setEmbeddingDimension: (dim: number) => void;

  // ── Tab 1: Data Preparation ──
  // Document embedding
  isEmbedding: boolean;
  setIsEmbedding: (val: boolean) => void;
  isEmbedded: boolean;
  setIsEmbedded: (val: boolean) => void;
  embeddingProgress: number;
  setEmbeddingProgress: (val: number) => void;
  indexName: string;
  setIndexName: (name: string) => void;
  documentCount: number;
  setDocumentCount: (count: number) => void;
  chunkCount: number;
  setChunkCount: (count: number) => void;

  // SQL setup
  isSqlReady: boolean;
  setIsSqlReady: (val: boolean) => void;
  isSettingUpSql: boolean;
  setIsSettingUpSql: (val: boolean) => void;
  sqlTables: string[];
  setSqlTables: (tables: string[]) => void;
  sqlRowCounts: Record<string, number>;
  setSqlRowCounts: (counts: Record<string, number>) => void;

  // ── Tab 2: Query Transform ──
  queryText: string;
  setQueryText: (text: string) => void;

  // HyDE
  hydeDocument: string;
  setHydeDocument: (doc: string) => void;
  isGeneratingHyde: boolean;
  setIsGeneratingHyde: (val: boolean) => void;

  // Multi-Query
  multiQueries: string[];
  setMultiQueries: (queries: string[]) => void;
  isGeneratingMultiQuery: boolean;
  setIsGeneratingMultiQuery: (val: boolean) => void;

  // ── Tab 3: Retrieval ──
  // Vector retrieval results
  retrievalResults: SearchResult[];
  setRetrievalResults: (results: SearchResult[]) => void;
  isRetrieving: boolean;
  setIsRetrieving: (val: boolean) => void;

  // Text-to-SQL results
  sqlResult: SqlResult | null;
  setSqlResult: (result: SqlResult | null) => void;
  isExecutingSql: boolean;
  setIsExecutingSql: (val: boolean) => void;
  generatedSql: string;
  setGeneratedSql: (sql: string) => void;

  // ── Tab 4: Reranking ──
  beforeRerank: RankedResult[];
  setBeforeRerank: (results: RankedResult[]) => void;
  afterRerank: RankedResult[];
  setAfterRerank: (results: RankedResult[]) => void;
  isReranking: boolean;
  setIsReranking: (val: boolean) => void;

  // ── Tab 5: Generation ──
  chatModel: string;
  setChatModel: (model: string) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  maxTokens: number;
  setMaxTokens: (tokens: number) => void;
  generatedResponse: string;
  setGeneratedResponse: (resp: string) => void;
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;

  // Pipeline status
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export const useAdvancedStore = create<AdvancedStore>((set) => ({
  // Session
  sessionId: getAdvancedSessionId(),

  // API Key
  openaiApiKey: '',
  setOpenaiApiKey: (key) => set({ openaiApiKey: key }),

  // Global Model Config
  embeddingModel: 'text-embedding-3-small',
  setEmbeddingModel: (model) => set({ embeddingModel: model }),
  embeddingDimension: 1024,
  setEmbeddingDimension: (dim) => set({ embeddingDimension: dim }),

  // Tab 1: Data Preparation
  isEmbedding: false,
  setIsEmbedding: (val) => set({ isEmbedding: val }),
  isEmbedded: false,
  setIsEmbedded: (val) => set({ isEmbedded: val }),
  embeddingProgress: 0,
  setEmbeddingProgress: (val) => set({ embeddingProgress: val }),
  indexName: '',
  setIndexName: (name) => set({ indexName: name }),
  documentCount: 0,
  setDocumentCount: (count) => set({ documentCount: count }),
  chunkCount: 0,
  setChunkCount: (count) => set({ chunkCount: count }),

  isSqlReady: false,
  setIsSqlReady: (val) => set({ isSqlReady: val }),
  isSettingUpSql: false,
  setIsSettingUpSql: (val) => set({ isSettingUpSql: val }),
  sqlTables: [],
  setSqlTables: (tables) => set({ sqlTables: tables }),
  sqlRowCounts: {},
  setSqlRowCounts: (counts) => set({ sqlRowCounts: counts }),

  // Tab 2: Query Transform
  queryText: '',
  setQueryText: (text) => set({ queryText: text }),

  hydeDocument: '',
  setHydeDocument: (doc) => set({ hydeDocument: doc }),
  isGeneratingHyde: false,
  setIsGeneratingHyde: (val) => set({ isGeneratingHyde: val }),

  multiQueries: [],
  setMultiQueries: (queries) => set({ multiQueries: queries }),
  isGeneratingMultiQuery: false,
  setIsGeneratingMultiQuery: (val) => set({ isGeneratingMultiQuery: val }),

  // Tab 3: Retrieval
  retrievalResults: [],
  setRetrievalResults: (results) => set({ retrievalResults: results }),
  isRetrieving: false,
  setIsRetrieving: (val) => set({ isRetrieving: val }),

  sqlResult: null,
  setSqlResult: (result) => set({ sqlResult: result }),
  isExecutingSql: false,
  setIsExecutingSql: (val) => set({ isExecutingSql: val }),
  generatedSql: '',
  setGeneratedSql: (sql) => set({ generatedSql: sql }),

  // Tab 4: Reranking
  beforeRerank: [],
  setBeforeRerank: (results) => set({ beforeRerank: results }),
  afterRerank: [],
  setAfterRerank: (results) => set({ afterRerank: results }),
  isReranking: false,
  setIsReranking: (val) => set({ isReranking: val }),

  // Tab 5: Generation
  chatModel: 'gpt-4.1-mini',
  setChatModel: (model) => set({ chatModel: model }),
  temperature: 0.3,
  setTemperature: (temp) => set({ temperature: temp }),
  maxTokens: 1500,
  setMaxTokens: (tokens) => set({ maxTokens: tokens }),
  generatedResponse: '',
  setGeneratedResponse: (resp) => set({ generatedResponse: resp }),
  isGenerating: false,
  setIsGenerating: (val) => set({ isGenerating: val }),

  // Pipeline
  currentStep: 0,
  setCurrentStep: (step) => set({ currentStep: step }),
}));
