# 02. AI 기능 설계

## 2.1 AI 전담 매니저

### 2.1.1 초기 진단 및 로드맵 생성

**입력 데이터:**
```typescript
interface UserProfile {
  targetCompany: string;      // 목표 기업
  targetPosition: string;     // 목표 직무
  currentSpecs: {
    gpa?: number;
    certifications: string[];
    activities: string[];
    internships: string[];
    languageScores: Record<string, number>;
  };
  timeline: number;           // 남은 기간 (개월)
}
```

**AI 로드맵 생성 알고리즘:**
```
1. 목표 기업/직무 합격자 평균 데이터 조회
2. 현재 스펙 vs 합격자 평균 비교 (갭 분석)
3. 남은 기간 기반 우선순위 산정
4. 단계별 마일스톤 생성
   - 1개월 차: 서류 준비
   - 2개월 차: 자격증 취득
   - 3개월 차: 포트폴리오 완성
   ...
5. 각 마일스톤별 세부 태스크 생성
```

**기술 스택:**
- OpenAI GPT-4 API
- 프롬프트 엔지니어링 (구조화된 JSON 출력)
- Few-shot learning (합격자 사례 학습)

---

### 2.1.2 일일 데일리 브리핑

**알고리즘:**
```python
def generate_daily_missions(user_id):
    # 1. 마감일 임박 항목 확인
    urgent_tasks = get_urgent_deadlines(user_id, days=7)
    
    # 2. 로드맵 기반 미션
    roadmap_tasks = get_roadmap_today_tasks(user_id)
    
    # 3. 루틴 미션
    routine_tasks = get_daily_routines(user_id)
    
    # 4. AI 우선순위 정렬
    missions = prioritize_with_ai(
        urgent_tasks + roadmap_tasks + routine_tasks,
        user_pattern=user_behavior_history[user_id]
    )
    
    return missions[:3]  # 상위 3개만 추천
```

**예시 출력:**
```json
{
  "date": "2026-03-13",
  "missions": [
    {
      "priority": 1,
      "type": "urgent",
      "title": "삼성전자 서류 마감 D-3",
      "description": "자소서 3번 문항 '리더십' 파트를 다듬어 보세요.",
      "estimated_time": "2시간"
    },
    {
      "priority": 2,
      "type": "routine",
      "title": "매일 알고리즘 1문제",
      "description": "프로그래머스 'DFS/BFS' 유형을 풀어보세요.",
      "estimated_time": "1시간"
    },
    {
      "priority": 3,
      "type": "roadmap",
      "title": "정보처리기사 기출 1회",
      "description": "3월 시험 대비, 오늘은 데이터베이스 파트를 공부하세요.",
      "estimated_time": "1.5시간"
    }
  ]
}
```

---

### 2.1.3 습관 형성 (루틴 트래커)

**루틴 유형:**
| 유형 | 예시 | 성취 기준 |
|------|------|-----------|
| 일일 | 매일 알고리즘 1문제 | 완료/미완료 |
| 주간 | 주 3회 산업 뉴스 스크랩 | 3/7회 이상 |
| 연속 | 7일 연속 출석 | 스트릭 유지 |

**게이미피케이션:**
- **스트릭 시스템**: 연속 달성 일수 표시
- **뱃지 시스템**: 
  - "7일 연속 출석" 뱃지
  - "알고리즘 마스터" (100문제 해결)
  - "자소서 초보 탈출" (5개 완성)

---

### 2.1.4 스펙 갭 분석

**비교 로직:**
```typescript
interface GapAnalysis {
  category: string;
  myScore: number;
  avgScore: number;
  gap: number;  // 음수면 부족
  priority: 'high' | 'medium' | 'low';
  suggestions: string[];
}

// 예시 결과
[
  {
    category: "어학",
    myScore: 850,  // TOEIC
    avgScore: 800,
    gap: +50,
    priority: "low",
    suggestions: ["현재 충분합니다. 다른 부분에 집중하세요."]
  },
  {
    category: "대외활동",
    myScore: 1,
    avgScore: 3,
    gap: -2,
    priority: "high",
    suggestions: [
      "현재 대외활동 1회로 평균보다 2회 부족합니다.",
      "추천 활동: 링커리어 서포터즈 (마감 D-7)",
      "추천 활동: 대기업 공모전 2건 (각 1개월 소요 예상)"
    ]
  }
]
```

---

## 2.2 AI 자소서 코칭

### 2.2.1 직무 키워드 적합도 검사

**알고리즘:**
```python
def check_keyword_fit(job_description, cover_letter):
    # 1. JD에서 키워드 추출
    jd_keywords = extract_keywords_with_ai(job_description)
    # 예: ["리더십", "데이터분석", "Python", "팀워크"]
    
    # 2. 자소서에서 키워드 매칭
    matched = []
    missing = []
    
    for keyword in jd_keywords:
        if keyword in cover_letter:
            matched.append(keyword)
        else:
            missing.append(keyword)
    
    # 3. 점수 계산
    score = len(matched) / len(jd_keywords) * 100
    
    return {
        "score": score,
        "matched_keywords": matched,
        "missing_keywords": missing,
        "suggestions": generate_suggestions(missing)
    }
```

---

### 2.2.2 표절률 검사

**방식:**
- **낶부 DB 비교**: 이전 사용자 자소서와 유사도 검사
- **외부 API**: 카피킬러 등 표절 검사 서비스 연동
- **AI 유사도**: GPT 임베딩 기반 유사도 측정

**임계값:**
- 0-30%: 안전 (녹색)
- 30-60%: 주의 (노란색) - 문장 재구성 권장
- 60%+: 위험 (빨간색) - 전면 수정 필요

---

### 2.2.3 소제목 자동 생성

**프롬프트 예시:**
```
다음 자소서 문단의 소제목을 3가지 생성해주세요.
소제목은 직무 관련 키워드를 포함하고, 10자 이내로 간결하게 작성해주세요.

[문단 내용]
대학 시절 동아리 회장으로서 50명 규모의 팀을 이끌었습니다. 
예산 500만원을 관리했으며, 연간 3회 행사를 성공적으로 개최했습니다.

[생성된 소제목 예시]
1. 리더십으로 이끈 50인의 팀
2. 예산 관리의 프로페셔널
3. 행사 기획 전문가
```

---

## 2.3 AI 모의 면접

### 2.3.1 시선 처리 분석

**기술:** MediaPipe Face Mesh (Google)
- 웹캠 실시간 얼굴 랜드마크 추적
- 시선 방향 추정 (왼쪽/오른쪽/중앙/아래)

**분석 항목:**
| 항목 | 좋음 | 나쁨 |
|------|------|------|
| 칼메라 응시 | 70%+ | 50% 미만 |
| 고개 흔들림 | 적음 | 잦음 |
| 아래 응시 | 10% 이하 | 30% 이상 |

**피드백 예시:**
> "칼메라 응시율이 85%로 좋습니다. 하면 답변 중 3번 정도는 아래를 보는 습관이 있습니다. 자신감 있는 태도를 위해 칼메라를 더 응시핳는 연습이 필요합니다."

---

### 2.3.2 음성 분석

**기술:** Web Audio API + TensorFlow.js

**분석 항목:**
- **말하기 속도**: 분당 120-150단어가 적정
- **음량 변동**: 일정한 음량 유지
- **떨림 (Pitch variation)**: 과도한 변동은 긴장 신호

**필러워드 탐지:**
```javascript
const fillerWords = ['어', '그', '음', '아', '그러니까', '뭐'];
// 음성 텍스트 변환 후 카운팅
```

**피드백 예시:**
> "분당 180단어로 조금 빠릅니다. 천천히 명확하게 말하는 연습이 필요합니다. '어', '그'를 총 12회 사용했습니다. 답변 전 2초 정지 후 말하는 습관을 들여보세요."

---

### 2.3.3 답변 내용 평가

**AI 평가 기준:**
- **STAR 기법 준수**: Situation-Task-Action-Result 구조
- **구체성**: 숫자/성과 포함 여부
- **직무 연관성**: 답변과 직무의 적합도
- **시간 준수**: 제한 시간 내 완료 여부

---

## 2.4 데이터 수집 및 학습 전략

### 개인화 모델
- 사용자별 행동 데이터 수집 (동의 기반)
- 미션 완료 패턴 학습 → 개인화 추천 강화
- 연합 학습(Federated Learning) 고려: 데이터 중앙화 없이 모델 개선

### 프라이버시 보호
- 민감 정보 암호화 저장
- AI 학습용 데이터 익명화
- 사용자 데이터 삭제 요청 즉시 처리
