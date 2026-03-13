# 04. 기술 아키텍처

## 4.1 시스템 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Web App   │  │  Mobile Web │  │   PWA       │             │
│  │  (Next.js)  │  │  (Responsive)│  │  (Future)   │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
└─────────┼────────────────┼────────────────┼──────────────────────┘
          │                │                │
          └────────────────┴────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │       API Gateway (Vercel)       │
          └────────────────┬────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                    Backend Layer                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Auth      │  │   Core      │  │    AI       │             │
│  │  Service    │  │  Services   │  │  Services   │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
└─────────┼────────────────┼────────────────┼──────────────────────┘
          │                │                │
          └────────────────┴────────────────┘
                           │
          ┌────────────────┴────────────────┐
│                    Data Layer                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  PostgreSQL │  │    Redis    │  │     S3      │             │
│  │  (Primary)  │  │   (Cache)   │  │  (Storage)  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4.2 기술 스택 상세

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 14.x | React 프레임워크, SSR/SSG |
| TypeScript | 5.x | 타입 안정성 |
| TailwindCSS | 3.x | 유틸리티 CSS |
| Headless UI | 1.x | 접근성 있는 컴포넌트 |
| React Query | 5.x | 서버 상태 관리 |
| Zustand | 4.x | 클라이언트 상태 관리 |
| Framer Motion | 10.x | 애니메이션 |

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| Node.js | 20.x | 런타임 |
| Express | 4.x | 웹 프레임워크 |
| TypeScript | 5.x | 타입 안정성 |
| Prisma | 5.x | ORM |
| Socket.IO | 4.x | 실시간 통신 |

### Database
| 기술 | 용도 |
|------|------|
| PostgreSQL | 메인 데이터베이스 |
| Redis | 세션, 캐시, 실시간 데이터 |
| MongoDB | 로그, 분석 데이터 (선택) |

### AI/ML
| 기술 | 용도 |
|------|------|
| OpenAI API | GPT-4, 임베딩 |
| TensorFlow.js | 클라이언트 측 AI |
| MediaPipe | 시선/얼굴 추적 |
| Web Audio API | 음성 분석 |

### Infrastructure
| 서비스 | 용도 |
|--------|------|
| Vercel | 프론트엔드 호스팅 |
| AWS / GCP | 백엔드, DB 호스팅 |
| Supabase | PostgreSQL DBaaS (대안) |
| Firebase | 인증, 실시간 DB (대안) |
| AWS S3 | 파일 저장 |
| CloudFront | CDN |

---

## 4.3 데이터베이스 스키마

### 핵심 테이블

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_company VARCHAR(100),
  target_position VARCHAR(100),
  timeline_months INTEGER,
  current_gpa DECIMAL(3,2),
  status VARCHAR(20) DEFAULT 'preparing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### roadmaps
```sql
CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  progress INTEGER DEFAULT 0,
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### tasks (일일 미션)
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  roadmap_id UUID REFERENCES roadmaps(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50), -- 'daily', 'weekly', 'urgent'
  priority INTEGER DEFAULT 3, -- 1: 높음, 2: 중간, 3: 낮음
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed
  deadline TIMESTAMP,
  estimated_minutes INTEGER,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### activities (활동 보관함)
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50), -- 'certification', 'internship', 'contest', 'activity'
  title VARCHAR(200) NOT NULL,
  organization VARCHAR(200),
  description TEXT,
  start_date DATE,
  end_date DATE,
  attachments JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### cover_letters
```sql
CREATE TABLE cover_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company VARCHAR(100),
  position VARCHAR(100),
  questions JSONB, -- [{question, answer}]
  ai_feedback JSONB,
  plagiarism_score INTEGER,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### badges
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_type VARCHAR(50), -- 'streak', 'achievement', 'special'
  name VARCHAR(100),
  description TEXT,
  icon_url TEXT,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### community_posts
```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50), -- 'study', 'anonymous', 'tips'
  title VARCHAR(200),
  content TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4.4 API 설계

### 인증 (Auth)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
```

### 사용자 (Users)
```
GET    /api/users/me
PUT    /api/users/me
PUT    /api/users/me/profile
GET    /api/users/me/stats
```

### 로드맵 (Roadmaps)
```
GET    /api/roadmaps
POST   /api/roadmaps
GET    /api/roadmaps/:id
PUT    /api/roadmaps/:id
DELETE /api/roadmaps/:id
POST   /api/roadmaps/generate-ai  # AI 로드맵 생성
```

### 미션 (Tasks)
```
GET    /api/tasks?date=today
POST   /api/tasks
PUT    /api/tasks/:id
PUT    /api/tasks/:id/complete
DELETE /api/tasks/:id
```

### AI 기능
```
POST   /api/ai/roadmap-generate
POST   /api/ai/cover-letter-feedback
POST   /api/ai/interview-feedback
POST   /api/ai/spec-gap-analysis
```

### 커뮤니티
```
GET    /api/community/posts
POST   /api/community/posts
GET    /api/community/posts/:id
POST   /api/community/posts/:id/comments
```

---

## 4.5 실시간 기능

### WebSocket 이벤트
```javascript
// Client → Server
socket.emit('task:complete', { taskId });
socket.emit('notification:read', { notificationId });

// Server → Client
socket.on('task:updated', (data) => {});
socket.on('notification:new', (data) => {});
socket.on('streak:updated', (data) => {});
```

### 알림 시스템
- 마감일 임박 알림 (D-3, D-1)
- 미션 완료 축하
- 스터디 매칭 완료
- 뱃지 획득

---

## 4.6 보안

### 인증
- JWT 토큰 (Access + Refresh)
- 소셜 로그인 (Google, Kakao, Naver)
- 비밀번호 해싱 (bcrypt)

### 데이터 보호
- 민감 정보 암호화 (AES-256)
- HTTPS/TLS 1.3
- CORS 설정
- Rate Limiting

### 개인정보
- GDPR/KISA 가이드라인 준수
- 데이터 주권 (엑셀 다운로드/삭제)
- AI 학습용 데이터 익명화
