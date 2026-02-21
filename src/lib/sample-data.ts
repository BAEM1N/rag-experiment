// SQL 테이블 정의 및 샘플 데이터 (정량적 데이터)
export const SQL_SCHEMA = `
CREATE TABLE financial_results (
  id INTEGER PRIMARY KEY,
  year INTEGER NOT NULL,
  quarter TEXT NOT NULL,
  division TEXT NOT NULL,
  revenue_billion REAL NOT NULL,
  operating_profit_billion REAL NOT NULL,
  growth_rate REAL NOT NULL
);

CREATE TABLE cloud_metrics (
  id INTEGER PRIMARY KEY,
  year INTEGER NOT NULL,
  service_name TEXT NOT NULL,
  revenue_billion REAL NOT NULL,
  growth_rate REAL NOT NULL,
  customer_count INTEGER NOT NULL
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  year INTEGER NOT NULL,
  department TEXT NOT NULL,
  headcount INTEGER NOT NULL,
  region TEXT NOT NULL
);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  project_name TEXT NOT NULL,
  division TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT NOT NULL
);
`;

export const SQL_INSERT_DATA = `
-- financial_results
INSERT INTO financial_results VALUES (1, 2023, '연간', 'IT서비스', 64000, 5800, 3.2);
INSERT INTO financial_results VALUES (2, 2023, '연간', '물류', 74300, 1390, -2.1);
INSERT INTO financial_results VALUES (3, 2024, '연간', 'IT서비스', 64000, 6100, 0.0);
INSERT INTO financial_results VALUES (4, 2024, '연간', '물류', 74300, 1390, 0.0);
INSERT INTO financial_results VALUES (5, 2024, 'Q1', 'IT서비스', 15200, 1450, 1.3);
INSERT INTO financial_results VALUES (6, 2024, 'Q2', 'IT서비스', 16100, 1520, 2.1);
INSERT INTO financial_results VALUES (7, 2024, 'Q3', 'IT서비스', 16500, 1580, 3.0);
INSERT INTO financial_results VALUES (8, 2024, 'Q4', 'IT서비스', 16200, 1550, -1.8);
INSERT INTO financial_results VALUES (9, 2025, '연간', 'IT서비스', 65400, 6571, 2.2);
INSERT INTO financial_results VALUES (10, 2025, '연간', '물류', 73900, 1300, -0.5);
INSERT INTO financial_results VALUES (11, 2025, 'Q1', 'IT서비스', 15800, 1580, 3.9);
INSERT INTO financial_results VALUES (12, 2025, 'Q2', 'IT서비스', 16300, 1620, 1.2);
INSERT INTO financial_results VALUES (13, 2025, 'Q3', 'IT서비스', 16800, 1700, 1.8);
INSERT INTO financial_results VALUES (14, 2025, 'Q4', 'IT서비스', 16500, 1671, -1.8);
INSERT INTO financial_results VALUES (15, 2025, 'Q1', '물류', 18500, 330, -1.1);
INSERT INTO financial_results VALUES (16, 2025, 'Q2', '물류', 18700, 340, 1.1);
INSERT INTO financial_results VALUES (17, 2025, 'Q3', '물류', 18900, 350, 1.1);
INSERT INTO financial_results VALUES (18, 2025, 'Q4', '물류', 17800, 280, -5.8);

-- cloud_metrics
INSERT INTO cloud_metrics VALUES (1, 2023, 'SCP', 12000, 18.5, 850);
INSERT INTO cloud_metrics VALUES (2, 2023, 'GPUaaS', 3200, 45.0, 120);
INSERT INTO cloud_metrics VALUES (3, 2023, 'Managed Service', 8000, 12.3, 620);
INSERT INTO cloud_metrics VALUES (4, 2024, 'SCP', 14500, 20.8, 1050);
INSERT INTO cloud_metrics VALUES (5, 2024, 'GPUaaS', 5800, 81.3, 280);
INSERT INTO cloud_metrics VALUES (6, 2024, 'Managed Service', 9200, 15.0, 750);
INSERT INTO cloud_metrics VALUES (7, 2025, 'SCP', 16800, 15.9, 1280);
INSERT INTO cloud_metrics VALUES (8, 2025, 'GPUaaS', 8500, 46.6, 450);
INSERT INTO cloud_metrics VALUES (9, 2025, 'Managed Service', 10500, 14.1, 890);

-- employees
INSERT INTO employees VALUES (1, 2023, 'IT서비스', 15200, '국내');
INSERT INTO employees VALUES (2, 2023, 'IT서비스', 3800, '해외');
INSERT INTO employees VALUES (3, 2023, '물류', 4500, '국내');
INSERT INTO employees VALUES (4, 2023, '물류', 2000, '해외');
INSERT INTO employees VALUES (5, 2024, 'IT서비스', 15800, '국내');
INSERT INTO employees VALUES (6, 2024, 'IT서비스', 4200, '해외');
INSERT INTO employees VALUES (7, 2024, '물류', 4300, '국내');
INSERT INTO employees VALUES (8, 2024, '물류', 2236, '해외');
INSERT INTO employees VALUES (9, 2025, 'IT서비스', 16000, '국내');
INSERT INTO employees VALUES (10, 2025, 'IT서비스', 4500, '해외');
INSERT INTO employees VALUES (11, 2025, '물류', 4200, '국내');
INSERT INTO employees VALUES (12, 2025, '물류', 2300, '해외');

-- projects
INSERT INTO projects VALUES (1, 'FabriX', 'IT서비스', 'AI 플랫폼', '운영중', '생성형 AI 개발 플랫폼으로 기업 맞춤형 AI 모델 구축 및 배포를 지원');
INSERT INTO projects VALUES (2, 'Brity Copilot', 'IT서비스', 'AI 솔루션', '운영중', 'AI 업무 보조 도구로 문서 작성, 요약, 분석 등 업무 생산성 향상');
INSERT INTO projects VALUES (3, 'Brity Automation', 'IT서비스', 'RPA', '운영중', 'RPA 기반 업무 자동화 플랫폼으로 반복 업무를 자동화');
INSERT INTO projects VALUES (4, 'Cello Square', '물류', '디지털 물류', '운영중', '디지털 포워딩 포함 종합 물류 플랫폼, 등록 기업 24,625개');
INSERT INTO projects VALUES (5, 'SCP', 'IT서비스', '클라우드', '운영중', '삼성 클라우드 플랫폼으로 멀티 클라우드 환경 지원');
INSERT INTO projects VALUES (6, 'GPUaaS', 'IT서비스', 'AI 인프라', '확장중', 'GPU 자원 서비스 형태 제공, NVIDIA B300 기반 신규 상품 준비중');
INSERT INTO projects VALUES (7, 'ChatGPT Enterprise', 'IT서비스', 'AI 파트너십', '신규', '국내 최초 OpenAI ChatGPT Enterprise 리셀러 파트너십');
INSERT INTO projects VALUES (8, 'DR Service', 'IT서비스', '인프라', '준비중', '재해복구(DR) 사업 추진');
`;

// 비정형 문서 (정성적 데이터) - 기존 3개 + 추가 4개
export const SAMPLE_DOCUMENTS = [
  {
    id: 'sds-results-2025',
    title: '삼성SDS 2025년 경영실적',
    content: `삼성SDS가 2026년 1월 22일 2025년 잠정 경영실적을 발표했다. 연간 매출 13조 9,300억 원, 영업이익 9,571억 원을 기록하며 전년 대비 각각 0.7%, 5.0% 성장했다.

IT서비스 부문은 연간 매출 6조 5,400억 원을 기록하며 전년 대비 2.2% 성장했다. 클라우드 사업이 매출 2조 6,800억 원으로 15.4% 성장하며 성장을 주도했다. 주요 성장 동력은 삼성 클라우드 플랫폼(SCP)을 통한 생성형 AI 서비스 확대, GPU-as-a-Service(GPUaaS), 고성능 컴퓨팅 확장이다.

물류 부문은 연간 매출 7조 3,900억 원으로 해상 운임 하락으로 전년 대비 0.5% 감소했다. 디지털 물류 플랫폼 첼로 스퀘어(Cello Square)는 등록 기업 수 24,625개로 27% 성장했다.

이사회는 주당 배당금을 전년 대비 10% 인상한 3,190원으로 의결했다.`,
  },
  {
    id: 'sds-overview',
    title: '삼성SDS 회사 개요',
    content: `삼성SDS는 데이터와 컴퓨팅 기술 리더로서, 생성형 AI와 클라우드 기반 IT서비스 및 디지털 물류 솔루션을 제공한다. 40년간 축적한 산업별 전문성을 기반으로 맞춤형 삼성 클라우드 플랫폼과 올인원 매니지드 서비스를 제공한다.

국내 매니지드 클라우드 서비스 시장 점유율 1위를 보유하고 있으며, IDC 마켓스케이프에서 글로벌 클라우드 프로페셔널 서비스 부문에서 인정받았다.

주요 솔루션으로 FabriX(생성형 AI 개발 플랫폼), Brity Copilot(AI 업무 보조), Brity Automation(RPA 자동화), SCP(삼성 클라우드 플랫폼), GPUaaS(GPU 서비스)를 제공한다.

글로벌 거점은 40개국 57개 법인·지사이며, 임직원 수는 약 25,000명이다.`,
  },
  {
    id: 'sds-devops',
    title: 'AI 기반 데브옵스 문서 자동화',
    content: `생성형 AI를 활용하면 기술 문서 작성 시간을 획기적으로 단축하고, 개발자가 핵심 업무에 집중할 수 있도록 지원할 수 있다.

생성형 AI 문서 자동화의 3가지 이점: 시간 절약 및 효율성, 정확성 유지, 데브옵스 문화 강화.

5가지 핵심 문서화 영역: 기능 작동 방식 문서화, API 및 데이터 문서화, 런타임 및 표준 운영 절차(SOP), AI 에이전트 학습용 문서, 레거시 애플리케이션 문서화.

AI가 생성한 문서는 반드시 전문가의 검토를 거쳐야 하며, 기존 CI/CD 파이프라인에 문서 자동화를 통합하는 것이 권장된다.`,
  },
  {
    id: 'sds-ai-strategy',
    title: '삼성SDS AI 전략 및 비전',
    content: `삼성SDS는 2026년 AI 인프라, 플랫폼, 솔루션 역량을 대폭 확대할 계획이다. NVIDIA B300 기반 차세대 GPUaaS 상품을 출시하고, 국내 최초로 확보한 OpenAI ChatGPT Enterprise 리셀러 파트너십을 통해 기업 고객에게 최적화된 AI 솔루션을 제공한다.

FabriX 플랫폼은 기업이 자체 데이터로 맞춤형 AI 모델을 구축할 수 있도록 지원하며, Brity Copilot은 문서 작성, 코드 리뷰, 데이터 분석 등 다양한 업무에 AI를 적용한다.

삼성SDS는 AI가 단순 도구가 아닌 비즈니스 프로세스 전반에 내재화되는 'AI-Native 전환'을 목표로 하고 있다. 이를 위해 AI 거버넌스 프레임워크를 수립하고, 책임 있는 AI 사용을 위한 가이드라인을 운영 중이다.`,
  },
  {
    id: 'sds-cloud-detail',
    title: '삼성SDS 클라우드 서비스 상세',
    content: `삼성 클라우드 플랫폼(SCP)은 컨설팅부터 매니지드 운영까지 엔드투엔드 클라우드 서비스를 제공한다. 2025년 SCP 매출은 1조 6,800억 원으로 전년 대비 15.9% 성장했으며, 고객 수는 1,280개사로 확대됐다.

GPUaaS 서비스는 AI 학습 및 추론 워크로드를 위한 GPU 자원을 클라우드 형태로 제공하며, 2025년 매출 8,500억 원, 성장률 46.6%를 기록했다. 고객 수는 450개사로 전년 대비 60.7% 증가했다.

매니지드 서비스는 금융권 클라우드 전환과 공공부문 AI 서비스 수주로 매출 1조 500억 원을 달성했다. 클라우드 보안 서비스도 강화하여, 제로 트러스트 아키텍처 기반 보안 솔루션을 제공하고 있다.`,
  },
  {
    id: 'sds-logistics',
    title: '삼성SDS 디지털 물류 혁신',
    content: `첼로 스퀘어(Cello Square)는 공급망 계획부터 실행까지 통합 글로벌 물류 서비스를 제공하는 디지털 물류 플랫폼이다. 2025년 등록 기업 수 24,625개로 전년 대비 27% 성장을 기록했다.

AI 기반 수요 예측 기능은 물류량 변동을 사전에 예측하여 최적의 운송 계획을 수립한다. 최적 경로 추천 알고리즘은 비용, 시간, 탄소 배출을 종합적으로 고려하여 경로를 제안한다.

2025년 물류 부문 매출은 7조 3,900억 원이나, 해상 운임 하락 지속으로 전년 대비 0.5% 감소했다. 그러나 디지털 포워딩 거래량은 35% 증가하며 디지털 전환이 가속화되고 있다.`,
  },
  {
    id: 'sds-security',
    title: '삼성SDS 보안 솔루션',
    content: `삼성SDS는 클라우드 보안, 엔드포인트 보안, 네트워크 보안 등 포괄적인 보안 서비스 포트폴리오를 보유하고 있다. 제로 트러스트 아키텍처 기반의 보안 프레임워크를 통해 기업 고객의 디지털 자산을 보호한다.

AI 기반 위협 탐지 시스템은 실시간으로 보안 이벤트를 분석하고, 이상 행위를 자동으로 감지한다. 2025년 기준 일 평균 50억 건 이상의 보안 이벤트를 처리하고 있다.

삼성SDS는 가트너(Gartner)와 IDC로부터 매니지드 보안 서비스 제공업체로 인정받았으며, ISO 27001, SOC 2 등 국제 보안 인증을 보유하고 있다. 금융, 공공, 제조 등 산업별 맞춤형 보안 컨설팅도 제공한다.`,
  },
];

// 데모 질의 예시
export const DEMO_QUERIES = [
  '삼성SDS의 2025년 매출은 얼마이고, 어떤 사업이 가장 성장했나요?',
  '삼성SDS 클라우드 서비스의 고객 수와 성장 추이는 어떻게 되나요?',
  '삼성SDS의 AI 전략과 주요 AI 솔루션은 무엇인가요?',
  '첼로 스퀘어의 등록 기업 수와 디지털 물류 혁신 현황은?',
  '삼성SDS의 부서별 인원 현황과 글로벌 거점은?',
];

// SQL 테이블 설명 (Text-to-SQL 프롬프트에 사용)
export const SQL_TABLE_DESCRIPTIONS = `
## 데이터베이스 테이블 스키마

### financial_results
재무 실적 테이블. 연도별, 분기별, 사업부별 매출 및 영업이익 데이터.
- id: 고유 ID
- year: 연도 (2023, 2024, 2025)
- quarter: 분기 ('연간', 'Q1', 'Q2', 'Q3', 'Q4')
- division: 사업부 ('IT서비스', '물류')
- revenue_billion: 매출 (억 원)
- operating_profit_billion: 영업이익 (억 원)
- growth_rate: 성장률 (%)

### cloud_metrics
클라우드 서비스 지표 테이블.
- id: 고유 ID
- year: 연도
- service_name: 서비스명 ('SCP', 'GPUaaS', 'Managed Service')
- revenue_billion: 매출 (억 원)
- growth_rate: 성장률 (%)
- customer_count: 고객 수

### employees
임직원 현황 테이블.
- id: 고유 ID
- year: 연도
- department: 부서 ('IT서비스', '물류')
- headcount: 인원 수
- region: 지역 ('국내', '해외')

### projects
주요 프로젝트 테이블.
- id: 고유 ID
- project_name: 프로젝트명
- division: 사업부
- category: 카테고리
- status: 상태 ('운영중', '확장중', '신규', '준비중')
- description: 설명
`;
