# Career PT Backend

Career PT MVP 백엔드 API

## 기술 스택

- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT 인증
- OpenAI API

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일을 편집하여 실제 값 입력
```

### 3. 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 마이그레이션
npm run db:migrate
```

### 4. 개발 서버 실행

```bash
npm run dev
```

### 5. 프로덕션 빌드 및 실행

```bash
npm run build
npm start
```

## API 엔드포인트

### 인증 (/api/auth)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | /register | 회원가입 |
| POST | /login | 로그인 |
| POST | /refresh | 토큰 갱신 |

### 사용자 (/api/users)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | /me | 내 정보 조회 |
| PUT | /me | 내 정보 수정 |
| GET | /me/stats | 통계 조회 |

### 로드맵 (/api/roadmaps)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | /generate | AI 로드맵 생성 |
| GET | / | 내 로드맵 조회 |
| GET | /:id | 특정 로드맵 조회 |
| PUT | /:id | 로드맵 수정 |
| DELETE | /:id | 로드맵 삭제 |

### 미션 (/api/tasks)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | /daily?date=YYYY-MM-DD | 오늘 미션 조회 |
| GET | / | 모든 미션 조회 |
| POST | /:id/complete | 미션 완료 체크 |
| GET | /stats | 완료 통계 |

### AI (/api/ai)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | /roadmap-generate | GPT로 로드맵 생성 |
| POST | /chat | AI 채팅 |

## 인증

모든 API 요청(인증 제외)에 `Authorization` 헤더가 필요합니다:

```
Authorization: Bearer <access_token>
```

## 예시 요청

### 회원가입

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "홍길동"
  }'
```

### 로그인

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### AI 로드맵 생성

```bash
curl -X POST http://localhost:3000/api/ai/roadmap-generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "targetCompany": "네이버",
    "targetPosition": "프론트엔드 개발자",
    "currentGpa": 3.5,
    "currentSkills": ["JavaScript", "HTML", "CSS"],
    "deadline": "2024-12-31"
  }'
```

## 데이터베이스 스키마

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  profile   Profile?
  roadmaps  Roadmap[]
  tasks     Task[]
}

model Profile {
  id             String  @id @default(uuid())
  userId         String  @unique
  targetCompany  String?
  targetPosition String?
  currentGpa     Float?
}

model Roadmap {
  id         String   @id @default(uuid())
  userId     String
  title      String
  milestones Json
}

model Task {
  id        String   @id @default(uuid())
  userId    String
  title     String
  status    String   // pending, completed
  date      DateTime
}
```