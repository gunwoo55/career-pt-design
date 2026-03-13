# Career PT 프론트엔드

AI 기반 취업 준비 코치 서비스 Career PT의 MVP 프론트엔드입니다.

## 기술 스택

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- React Hook Form (폼 관리)
- Zustand (상태 관리)
- Lucide React (아이콘)

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 접속할 수 있습니다.

## 페이지 구성

| 경로 | 설명 |
|------|------|
| `/` | 루트 - 온볼딩으로 리다이렉트 |
| `/onboarding` | 4단계 온볼딩 플로우 |
| `/dashboard` | 데일리 대시보드 (미션, 진행률) |
| `/roadmap` | 타임라인 형태 로드맵 |
| `/profile` | 내 정보 및 설정 |

## 주요 기능

### 온볼딩 플로우
1. **Step 1**: 목표 직무 선택 (드롭다운)
2. **Step 2**: 현재 스펙 입력 (학점, 자격증, 활동)
3. **Step 3**: 남은 기간 선택 (3개월~2년)
4. **Step 4**: AI 로드맵 생성 로딩
5. **Step 5**: 결과 확인 및 대시보드 이동

### 데일리 대시보드
- 오늘의 미션 리스트 (체크박스 토글)
- 진행률 표시 (일일/전체)
- 연속 출석 스트릭 표시
- 하단 네비게이션

### 로드맵 페이지
- 타임라인 형태 로드맵 (4단계)
- 단계별 체크리스트 토글
- 진행률 표시
- 카테고리별 배지 (학습/자격증/활동/포트폴리오)

### 프로필 페이지
- 내 스펙 표시/수정
- 설정 메뉴 (알림, 테마 등)

## 상태 관리

Zustand를 사용하여 다음 상태를 관리합니다:

- `useOnboardingStore`: 온볼딩 진행 상태 및 사용자 스펙
- `useRoadmapStore`: 로드맵 데이터 및 진행 상황
- `useDashboardStore`: 오늘의 미션 및 체크인 데이터

## 디자인

- 모바일 퍼스트 반응형 디자인
- 심플한 UI (Tailwind 기본 유틸리티)
- 블루/그린 계열 색상 (`primary`, `success`)
