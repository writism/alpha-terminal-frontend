# Alpha-Desk Frontend — 프론트엔드 개발 가이드

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| UI 라이브러리 | React 19 |
| 상태 관리 | Jotai |
| 스타일링 | Tailwind CSS |
| HTTP 클라이언트 | `infrastructure/http/httpClient.ts` (`http` 객체) |
| 환경변수 관리 | `infrastructure/config/env.ts` |

## 실행 방법

```bash
# 이 디렉토리(alpha-desk-frontend)에서 실행
npm install
npm run dev
# → http://localhost:3000
```

---

## 아키텍처: Feature-Based DDD

### 디렉토리 구조 (모든 feature 공통)

```
features/{featureName}/
├── domain/
│   ├── intent/     # 사용자 의도 (enum/상수)
│   ├── model/      # 도메인 모델 (TypeScript interface)
│   └── state/      # 상태 타입 (discriminated union)
├── application/
│   ├── atoms/      # Jotai 아톰 (전역 상태)
│   ├── commands/   # 커맨드 핸들러 (액션)
│   ├── hooks/      # 커스텀 React 훅
│   └── selectors/  # 파생 상태 셀렉터
├── infrastructure/
│   └── api/        # API 호출 함수
└── ui/
    └── components/ # 피처 전용 UI 컴포넌트
```

### 핵심 규칙 (반드시 준수)

- 전역 상태: Jotai 아톰 사용
- API 호출: `infrastructure/http/httpClient.ts`의 `http` 객체 사용
- 환경변수: `infrastructure/config/env.ts`에서 관리
- 스타일: Tailwind CSS 유틸리티 클래스
- 페이지: `app/` 디렉토리 (Next.js App Router)
- 클라이언트 컴포넌트: `"use client"` 명시 필수

### 참고 기존 코드

- `features/auth/` — Feature 모듈 전체 구조 패턴
- `features/auth/application/atoms/authAtom.ts` — Jotai 아톰 패턴
- `features/auth/application/hooks/useAuth.ts` — 커스텀 훅 패턴
- `ui/components/button/` — UI 컴포넌트 variant 패턴
- `components/Navbar.tsx` — 네비게이션 연동

---

## 기존 Feature 모듈

| Feature | 경로 | 설명 |
|---------|------|------|
| auth | `features/auth/` | Google/Kakao OAuth 로그인 |
| upload | `features/upload/` | PDF 파일 업로드 (S3) |

---

## 신규 개발 Feature (김민정 담당)

### 1. Watchlist — 관심종목 관리
```
features/watchlist/
├── domain/
│   ├── intent/watchlistIntent.ts
│   ├── model/watchlistItem.ts      # { symbol, name, market }
│   └── state/watchlistState.ts
├── application/
│   ├── atoms/watchlistAtom.ts
│   ├── commands/watchlistCommand.ts
│   ├── hooks/useWatchlist.ts
│   └── selectors/watchlistSelectors.ts
├── infrastructure/api/watchlistApi.ts
└── ui/components/
    ├── WatchlistManager.tsx
    └── StockSearchInput.tsx
```

### 2. Dashboard — 요약 대시보드
```
features/dashboard/
├── domain/
│   ├── model/stockSummary.ts       # { symbol, name, summary, tags, date }
│   ├── model/riskTag.ts            # { name, category, score }
│   └── state/dashboardState.ts
├── application/
│   ├── atoms/dashboardAtom.ts
│   ├── hooks/useDashboard.ts
│   └── selectors/dashboardSelectors.ts
├── infrastructure/api/dashboardApi.ts
└── ui/components/
    ├── DashboardPage.tsx
    ├── StockSummaryCard.tsx
    ├── RiskTagBadge.tsx
    ├── TagFilterBar.tsx
    └── SummaryTimeline.tsx
```

---

## 신규 페이지 라우트

```
app/
├── dashboard/page.tsx          # 메인 대시보드
├── watchlist/page.tsx          # 관심종목 관리
└── stock/[symbol]/page.tsx     # 종목 상세
```

---

## API 연동 패턴

```typescript
// API 호출 예시 (infrastructure/api/*.ts)
import { http } from "@/infrastructure/http/httpClient"

export const dashboardApi = {
  getSummaries: (date?: string) =>
    http.get<StockSummary[]>(`/stock-analyzer/summaries${date ? `?date=${date}` : ""}`),
  getSummaryDetail: (symbol: string) =>
    http.get<StockSummaryDetail>(`/stock-analyzer/summaries/${symbol}`),
  getTags: (symbol: string) =>
    http.get<RiskTag[]>(`/stock-analyzer/summaries/${symbol}/tags`),
}

export const watchlistApi = {
  getWatchlist: () => http.get<WatchlistItem[]>("/watchlist"),
  addStock: (symbol: string) => http.post("/watchlist", { symbol }),
  removeStock: (symbol: string) => http.delete(`/watchlist/${symbol}`),
}
```

---

## RiskTagBadge 색상 규칙

| 카테고리 | 배경색 | 텍스트 | 예시 |
|----------|--------|--------|------|
| RISK | `bg-red-100` | `text-red-700` | `#실적쇼크우려` |
| POSITIVE | `bg-green-100` | `text-green-700` | `#실적호조` |
| NEUTRAL | `bg-gray-100` | `text-gray-600` | `#인사변동` |

---

## 환경 변수

`.env.local` 파일 사용 (`.env.local.example` 복사 후 값 입력):

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:33333
NEXT_PUBLIC_KAKAO_LOGIN_PATH=/kakao-authentication/login
NEXT_PUBLIC_GOOGLE_LOGIN_PATH=/authentication/google
```
