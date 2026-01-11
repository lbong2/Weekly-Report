# CLAUDE.md

이 파일은 Claude Code가 프로젝트를 이해하고 효과적으로 작업하기 위한 가이드입니다.

---

## 프로젝트 개요

**주간보고 시스템** - SM 프로젝트 주간보고서를 웹에서 작성하고 PPT로 자동 생성하는 사내 시스템

### 핵심 목표
- 담당자들이 웹에서 각자 업무 실적/계획 작성
- 작성된 내용을 취합하여 PPT 파일 자동 생성
- 인원현황(휴가/출장) 관리

### 사용자
- 포항운영팀 약 10명
- 사내 내부망 서버에서 운영

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 백엔드 | Nest.js (TypeScript) |
| 프론트엔드 | Next.js 14+ (App Router, TypeScript) |
| DB | PostgreSQL (Docker) |
| ORM | TypeORM 또는 Prisma |
| 인증 | JWT (passport-jwt) |
| UI | Tailwind CSS + shadcn/ui |
| 상태관리 | Zustand |
| PPT 생성 | pptxgenjs |
| 패키지 관리 | pnpm (monorepo workspace) |

---

## 프로젝트 구조

```
weekly-report/
├── apps/
│   ├── backend/          # Nest.js API 서버
│   └── frontend/         # Next.js 웹 클라이언트
├── packages/
│   └── shared/           # 공통 타입, 유틸
├── docs/                 # 설계 문서
├── docker-compose.yml
└── CLAUDE.md
```

---

## 주요 엔터티

1. **User** - 사용자 (email, password, name, team, role)
2. **Team** - 팀 (name, location, totalMembers)
3. **Chain** - 모듈/체인 (code, name) - 업무 분류
4. **WeeklyReport** - 주간보고서 (year, weekNumber, weekStart, weekEnd, status)
5. **Task** - 업무 항목 (chain, title, purpose, 일정, 담당자, 금주실적, 차주계획)
6. **TaskAssignee** - 업무-담당자 매핑 (N:M)
7. **AttendanceType** - 출결 유형 (연차, 출장, 출산휴가 등)
8. **Attendance** - 출결 기록 (user, type, 기간, 내용)

상세 스키마는 `docs/entity-design.md` 참조

---

## API 구조

Base URL: `/api/v1`

| 리소스 | 엔드포인트 |
|--------|------------|
| 인증 | /auth/login, /auth/me |
| 사용자 | /users |
| 팀 | /teams |
| 모듈 | /chains |
| 주간보고서 | /weekly-reports |
| 업무 | /weekly-reports/:id/tasks, /tasks/:id |
| 출결유형 | /attendance-types |
| 출결 | /weekly-reports/:id/attendances |
| PPT 내보내기 | /weekly-reports/:id/export/pptx |

상세 명세는 `docs/api-design.md` 참조

---

## 화면 구조

| 경로 | 화면 | 권한 |
|------|------|------|
| /login | 로그인 | - |
| / | 주간보고서 목록 | USER |
| /reports/[id] | 주간보고서 상세 (업무/인원현황 탭) | USER |
| /admin/users | 사용자 관리 | ADMIN |
| /admin/teams | 팀 관리 | ADMIN |
| /admin/chains | 모듈 관리 | ADMIN |
| /admin/attendance-types | 출결유형 관리 | ADMIN |

상세 와이어프레임은 `docs/ui-design.md` 참조

---

## 개발 컨벤션

### 네이밍

```typescript
// 파일명: kebab-case
weekly-reports.controller.ts
weekly-reports.service.ts

// 클래스명: PascalCase
class WeeklyReportsController {}
class WeeklyReportsService {}

// 변수/함수: camelCase
const weeklyReport = await this.service.findOne(id);
async createWeeklyReport(dto: CreateWeeklyReportDto) {}

// 상수: SCREAMING_SNAKE_CASE
const MAX_PAGE_SIZE = 100;

// 엔터티 컬럼: camelCase (DB는 snake_case로 자동 변환)
@Column()
weekStart: Date;
```

### 디렉토리 구조 (Nest.js 모듈)

```
src/
└── weekly-reports/
    ├── weekly-reports.module.ts
    ├── weekly-reports.controller.ts
    ├── weekly-reports.service.ts
    ├── entities/
    │   └── weekly-report.entity.ts
    └── dto/
        ├── create-weekly-report.dto.ts
        ├── update-weekly-report.dto.ts
        └── weekly-report-response.dto.ts
```

### 디렉토리 구조 (Next.js)

```
src/
├── app/
│   └── reports/
│       ├── page.tsx           # 목록 페이지
│       └── [id]/
│           └── page.tsx       # 상세 페이지
├── components/
│   └── reports/
│       ├── ReportCard.tsx
│       ├── ReportList.tsx
│       ├── TaskForm.tsx
│       └── TaskList.tsx
└── hooks/
    └── useReports.ts
```

---

## 중요 비즈니스 로직

### 1. PPT 생성 규칙

- **슬라이드 타입 1 (업무 실적/계획)**: Task 2개당 1슬라이드
  - 좌측: 금주 실적
  - 우측: 차주 계획
- **슬라이드 타입 2 (인원현황)**: 팀당 1장, 맨 마지막
  - 인원현황, 출장/교육, 휴가 섹션

### 2. 마크다운 → PPT 변환

`this_week_content`, `next_week_content` 필드는 마크다운 형식으로 저장:

```markdown
- 1depth 항목
  - 2depth 항목
    - 3depth 항목
```

PPT 생성 시 bullet 계층으로 파싱하여 변환

### 3. 인원 계산

```
현재 인원 = Team.totalMembers - (is_long_term = true인 Attendance 수)
```

### 4. 진척률 자동 계산

```
progress = (completedCount / totalCount) * 100
```

---

## 환경 변수

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=weekly_report
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# App
PORT=4000
FRONTEND_URL=http://localhost:3001
```

---

## 명령어

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev              # 전체 (백엔드 + 프론트엔드)
pnpm dev:backend      # 백엔드만
pnpm dev:frontend     # 프론트엔드만

# 빌드
pnpm build

# 데이터베이스
pnpm db:migrate       # 마이그레이션 실행
pnpm db:seed          # 초기 데이터 삽입

# Docker
docker-compose up -d  # PostgreSQL 실행
```

---

## 초기 데이터 (Seed)

### Chain (모듈)
- D_MEGA_BEAM / D-Mega Beam
- PROCESS_PLAN / 공정계획
- OPERATION_MGMT / 조업관리
- OPERATION_REPORT / 조업진행 Report

### AttendanceType (출결 유형)
- ANNUAL / 연차 / LEAVE / false
- SICK / 병가 / LEAVE / false
- FAMILY_EVENT / 경조휴가 / LEAVE / false
- MATERNITY / 출산휴가 / LEAVE / true
- PARENTAL / 육아휴직 / LEAVE / true
- TRAINING / 훈련 / LEAVE / false
- BUSINESS_TRIP / 출장 / BUSINESS_TRIP / false
- LONG_BUSINESS_TRIP / 장기출장 / BUSINESS_TRIP / true

### 기본 관리자 계정
- email: admin@company.com
- password: admin123 (변경 필요)
- role: ADMIN

---

## 작업 우선순위

### Phase 1 (MVP)
1. 프로젝트 세팅 (모노레포, Docker, DB)
2. 인증 (로그인, JWT)
3. 주간보고서 CRUD
4. 업무(Task) CRUD
5. **PPT 내보내기** ← 핵심 기능

### Phase 2
6. 인원현황 (Attendance) CRUD
7. 관리자 페이지 (Chain, AttendanceType 관리)
8. 사용자/팀 관리

### Phase 3 (개선)
9. UI 개선
10. 필터/검색 기능
11. 알림 기능 (선택)

---

## 참고 문서

- `docs/entity-design.md` - 엔터티 설계서
- `docs/ui-design.md` - 화면 설계서
- `docs/api-design.md` - API 설계서

---

## 주의사항

1. **PPT 내보내기는 필수 기능** - 이 기능이 안 되면 프로젝트 실패
2. 사내 시스템이므로 회원가입은 관리자만 가능
3. 같은 팀이면 누구나 업무 수정 가능 (담당자 제한 없음)
4. 휴가/출장은 본인 것 외에 다른 팀원 것도 등록 가능
5. 모듈(Chain), 출결유형(AttendanceType)은 관리자가 추가/삭제 가능해야 함
