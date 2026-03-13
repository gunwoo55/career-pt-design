# Career PT AI 서비스

OpenAI API를 활용한 취업 준비 AI 기능 모듈입니다.

## 📁 파일 구조

```
/backend/services/ai/
├── openai.ts           # OpenAI 클라이언트 설정
├── roadmapGenerator.ts # 로드맵 생성 서비스
├── missionGenerator.ts # 일일 미션 생성 서비스
├── coverLetterReview.ts # 자소서 첨삭 서비스
└── index.ts            # 통합 export
```

## 🔧 설치

```bash
npm install openai dotenv
```

## ⚙️ 환경 설정

`.env` 파일에 OpenAI API 키를 설정하세요:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## 🚀 사용 예시

### 1. 로드맵 생성

```typescript
import { generateRoadmap } from './services/ai';

const roadmap = await generateRoadmap({
  targetCompany: '삼성전자',
  targetPosition: '소프트웨어 엔지니어',
  currentSpecs: {
    education: '컴퓨터공학 학사',
    certifications: ['정보처리기사'],
    experience: '프론트엔드 개발 1년',
    skills: ['React', 'TypeScript', 'Node.js'],
  },
  timeline: 6,
});

console.log(roadmap.title);
console.log(roadmap.milestones);
```

### 2. 일일 미션 생성

```typescript
import { generateDailyMissions } from './services/ai';

const missions = await generateDailyMissions({
  userId: 'user123',
  roadmap: roadmap,
  currentMonth: 2,
  deadlineDate: new Date('2024-06-30'),
  userPreferences: {
    dailyAvailableTime: 120,
    focusAreas: ['알고리즘', '포트폴리오'],
  },
});

console.log(missions); // [{ id, title, description, estimatedTime, priority, category }, ...]
```

### 3. 자소서 첨삭

```typescript
import { reviewCoverLetter, extractKeywords } from './services/ai';

// 키워드 추출
const keywords = await extractKeywords(jobDescription);

// 자소서 첨삭
const review = await reviewCoverLetter(
  coverLetterText,
  jobDescription,
  {
    detailedRewrite: true,
    focusAreas: ['리더십', '문제해결능력'],
    maxLength: 1500,
  }
);

console.log(review.overallScore);
console.log(review.keywordMatch);
console.log(review.improvements);
```

## 💰 비용 안내

- GPT-4: 약 $0.03/1K tokens
- GPT-3.5-turbo: 약 $0.0015/1K tokens
- 예상 월 비용: $5-18 (묣료 티어)

## 📚 API 레퍼런스

### RoadmapGenerator

| 함수 | 설명 |
|------|------|
| `generateRoadmap(input)` | 사용자 스펙 기반 로드맵 생성 |
| `generateDetailedPlan(roadmap, month)` | 특정 월 세부 계획 생성 |

### MissionGenerator

| 함수 | 설명 |
|------|------|
| `generateDailyMissions(input)` | 오늘의 미션 3개 생성 |
| `generateMissionGuide(mission)` | 미션별 가이드 생성 |
| `generateWeeklyReport(completed, roadmap)` | 주간 리포트 생성 |

### CoverLetterReview

| 함수 | 설명 |
|------|------|
| `reviewCoverLetter(text, jd, options)` | 자소서 종합 첨삭 |
| `extractKeywords(jobDescription)` | JD 핵심 키워드 추출 |
| `rewriteParagraph(text, context, keywords)` | 문단 재작성 |
| `analyzeFit(coverLetter, jd)` | 적합도 분석 |
