# 주간보고 시스템 - 프로젝트 구조 설계서

## 개요

Nest.js + Next.js 모노레포 구조의 프로젝트 설계 문서입니다.

---

## 기술 스택 상세

### 백엔드 (apps/backend)

| 구분 | 기술 | 버전 |
|------|------|------|
| 런타임 | Node.js | 20.x LTS |
| 프레임워크 | Nest.js | 10.x |
| 언어 | TypeScript | 5.x |
| ORM | Prisma | 5.x |
| 인증 | Passport + JWT | - |
| 유효성검사 | class-validator | - |
| PPT 생성 | pptxgenjs | 3.x |
| API 문서 | Swagger | - |

### 프론트엔드 (apps/frontend)

| 구분 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 14.x |
| 언어 | TypeScript | 5.x |
| 스타일링 | Tailwind CSS | 3.x |
| UI 컴포넌트 | shadcn/ui | - |
| 상태관리 | Zustand | 4.x |
| HTTP 클라이언트 | Axios 또는 Fetch | - |
| 폼 관리 | React Hook Form | 7.x |
| 날짜 처리 | date-fns | - |

### 인프라

| 구분 | 기술 |
|------|------|
| 데이터베이스 | PostgreSQL 15+ |
| 컨테이너 | Docker + Docker Compose |
| 패키지 관리 | pnpm (workspace) |

---

## 디렉토리 구조

```
weekly-report/
│
├── CLAUDE.md                        # Claude Code 가이드
├── README.md                        # 프로젝트 설명
├── package.json                     # 루트 (workspaces 설정)
├── pnpm-workspace.yaml              # pnpm 워크스페이스
├── turbo.json                       # Turborepo 설정 (선택)
├── docker-compose.yml               # Docker 설정
├── .env.example                     # 환경변수 예시
├── .gitignore
│
├── apps/
│   │
│   ├── backend/                     # ===== Nest.js 백엔드 =====
│   │   ├── src/
│   │   │   ├── main.ts              # 엔트리포인트
│   │   │   ├── app.module.ts        # 루트 모듈
│   │   │   │
│   │   │   ├── common/              # 공통 유틸리티
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   └── roles.guard.ts
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── current-user.decorator.ts
│   │   │   │   │   └── roles.decorator.ts
│   │   │   │   ├── filters/
│   │   │   │   │   └── http-exception.filter.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── transform.interceptor.ts
│   │   │   │   └── pipes/
│   │   │   │       └── validation.pipe.ts
│   │   │   │
│   │   │   ├── config/              # 설정
│   │   │   │   ├── database.config.ts
│   │   │   │   └── jwt.config.ts
│   │   │   │
│   │   │   ├── prisma/              # Prisma
│   │   │   │   ├── prisma.module.ts
│   │   │   │   ├── prisma.service.ts
│   │   │   │   └── schema.prisma
│   │   │   │
│   │   │   ├── auth/                # 인증 모듈
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   └── jwt.strategy.ts
│   │   │   │   └── dto/
│   │   │   │       ├── login.dto.ts
│   │   │   │       └── auth-response.dto.ts
│   │   │   │
│   │   │   ├── users/               # 사용자 모듈
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-user.dto.ts
│   │   │   │       ├── update-user.dto.ts
│   │   │   │       └── user-response.dto.ts
│   │   │   │
│   │   │   ├── teams/               # 팀 모듈
│   │   │   │   ├── teams.module.ts
│   │   │   │   ├── teams.controller.ts
│   │   │   │   ├── teams.service.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── chains/              # 모듈/체인
│   │   │   │   ├── chains.module.ts
│   │   │   │   ├── chains.controller.ts
│   │   │   │   ├── chains.service.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── weekly-reports/      # 주간보고서 모듈
│   │   │   │   ├── weekly-reports.module.ts
│   │   │   │   ├── weekly-reports.controller.ts
│   │   │   │   ├── weekly-reports.service.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── tasks/               # 업무 모듈
│   │   │   │   ├── tasks.module.ts
│   │   │   │   ├── tasks.controller.ts
│   │   │   │   ├── tasks.service.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── attendance-types/    # 출결 유형 모듈
│   │   │   │   ├── attendance-types.module.ts
│   │   │   │   ├── attendance-types.controller.ts
│   │   │   │   ├── attendance-types.service.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── attendances/         # 출결 모듈
│   │   │   │   ├── attendances.module.ts
│   │   │   │   ├── attendances.controller.ts
│   │   │   │   ├── attendances.service.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   └── export/              # PPT 내보내기 모듈
│   │   │       ├── export.module.ts
│   │   │       ├── export.controller.ts
│   │   │       ├── export.service.ts
│   │   │       └── utils/
│   │   │           ├── markdown-parser.ts    # 마크다운 → bullet 변환
│   │   │           └── slide-builder.ts      # 슬라이드 생성 헬퍼
│   │   │
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # Prisma 스키마
│   │   │   ├── migrations/          # 마이그레이션
│   │   │   └── seed.ts              # 초기 데이터
│   │   │
│   │   ├── test/                    # 테스트
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   └── .env
│   │
│   │
│   └── frontend/                    # ===== Next.js 프론트엔드 =====
│       ├── src/
│       │   ├── app/                 # App Router
│       │   │   ├── layout.tsx       # 루트 레이아웃
│       │   │   ├── page.tsx         # 메인 (주간보고서 목록)
│       │   │   ├── globals.css
│       │   │   │
│       │   │   ├── login/
│       │   │   │   └── page.tsx
│       │   │   │
│       │   │   ├── reports/
│       │   │   │   ├── page.tsx              # 목록 (리다이렉트 또는 동일)
│       │   │   │   └── [id]/
│       │   │   │       └── page.tsx          # 상세
│       │   │   │
│       │   │   └── admin/
│       │   │       ├── layout.tsx            # 관리자 레이아웃
│       │   │       ├── users/
│       │   │       │   └── page.tsx
│       │   │       ├── teams/
│       │   │       │   └── page.tsx
│       │   │       ├── chains/
│       │   │       │   └── page.tsx
│       │   │       └── attendance-types/
│       │   │           └── page.tsx
│       │   │
│       │   ├── components/          # 컴포넌트
│       │   │   ├── ui/              # shadcn/ui 컴포넌트
│       │   │   │   ├── button.tsx
│       │   │   │   ├── input.tsx
│       │   │   │   ├── select.tsx
│       │   │   │   ├── modal.tsx
│       │   │   │   ├── table.tsx
│       │   │   │   ├── card.tsx
│       │   │   │   ├── tabs.tsx
│       │   │   │   └── ...
│       │   │   │
│       │   │   ├── layout/          # 레이아웃 컴포넌트
│       │   │   │   ├── Header.tsx
│       │   │   │   ├── Sidebar.tsx
│       │   │   │   └── Footer.tsx
│       │   │   │
│       │   │   ├── auth/            # 인증 관련
│       │   │   │   └── LoginForm.tsx
│       │   │   │
│       │   │   ├── reports/         # 주간보고서 관련
│       │   │   │   ├── ReportCard.tsx
│       │   │   │   ├── ReportList.tsx
│       │   │   │   ├── CreateReportModal.tsx
│       │   │   │   ├── TaskList.tsx
│       │   │   │   ├── TaskCard.tsx
│       │   │   │   ├── TaskForm.tsx
│       │   │   │   ├── AttendanceList.tsx
│       │   │   │   ├── AttendanceCard.tsx
│       │   │   │   └── AttendanceForm.tsx
│       │   │   │
│       │   │   └── admin/           # 관리자 관련
│       │   │       ├── UserTable.tsx
│       │   │       ├── UserForm.tsx
│       │   │       ├── TeamTable.tsx
│       │   │       ├── ChainTable.tsx
│       │   │       └── AttendanceTypeTable.tsx
│       │   │
│       │   ├── hooks/               # 커스텀 훅
│       │   │   ├── useAuth.ts
│       │   │   ├── useReports.ts
│       │   │   ├── useTasks.ts
│       │   │   ├── useAttendances.ts
│       │   │   └── useAdmin.ts
│       │   │
│       │   ├── lib/                 # 유틸리티
│       │   │   ├── api.ts           # API 클라이언트 (axios 인스턴스)
│       │   │   ├── auth.ts          # 인증 유틸
│       │   │   ├── utils.ts         # 기타 유틸
│       │   │   └── constants.ts     # 상수
│       │   │
│       │   ├── stores/              # Zustand 스토어
│       │   │   ├── authStore.ts
│       │   │   └── uiStore.ts
│       │   │
│       │   └── types/               # 타입 정의
│       │       ├── auth.ts
│       │       ├── user.ts
│       │       ├── team.ts
│       │       ├── chain.ts
│       │       ├── weekly-report.ts
│       │       ├── task.ts
│       │       ├── attendance.ts
│       │       └── api.ts
│       │
│       ├── public/
│       │   └── logo.svg
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.js
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       └── .env.local
│
│
├── packages/                        # ===== 공유 패키지 (선택) =====
│   └── shared/
│       ├── src/
│       │   ├── types/               # 공통 타입
│       │   │   ├── index.ts
│       │   │   └── enums.ts
│       │   └── utils/               # 공통 유틸
│       │       └── date.ts
│       ├── package.json
│       └── tsconfig.json
│
│
└── docs/                            # ===== 설계 문서 =====
    ├── entity-design.md
    ├── ui-design.md
    ├── api-design.md
    └── project-structure.md
```

---

## 설정 파일

### 루트 package.json

```json
{
  "name": "weekly-report",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "dev:backend": "pnpm --filter backend dev",
    "dev:frontend": "pnpm --filter frontend dev",
    "build": "turbo run build",
    "db:migrate": "pnpm --filter backend prisma:migrate",
    "db:seed": "pnpm --filter backend prisma:seed",
    "db:studio": "pnpm --filter backend prisma:studio"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: weekly-report-db
    environment:
      POSTGRES_DB: weekly_report
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### .env.example

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/weekly_report?schema=public"

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# App
PORT=4000
FRONTEND_URL=http://localhost:3001

# Node
NODE_ENV=development
```

---

## Prisma 스키마

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum ReportStatus {
  DRAFT
  COMPLETED
}

enum AttendanceCategory {
  LEAVE
  BUSINESS_TRIP
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(USER)
  teamId    String   @map("team_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  team        Team          @relation(fields: [teamId], references: [id])
  tasks       TaskAssignee[]
  attendances Attendance[]

  @@map("users")
}

model Team {
  id           String   @id @default(uuid())
  name         String
  location     String?
  totalMembers Int      @default(0) @map("total_members")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  users         User[]
  weeklyReports WeeklyReport[]

  @@map("teams")
}

model Chain {
  id        String   @id @default(uuid())
  code      String   @unique
  name      String
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  tasks Task[]

  @@map("chains")
}

model WeeklyReport {
  id         String       @id @default(uuid())
  teamId     String       @map("team_id")
  year       Int
  weekNumber Int          @map("week_number")
  weekStart  DateTime     @map("week_start") @db.Date
  weekEnd    DateTime     @map("week_end") @db.Date
  status     ReportStatus @default(DRAFT)
  createdAt  DateTime     @default(now()) @map("created_at")
  updatedAt  DateTime     @updatedAt @map("updated_at")

  team        Team         @relation(fields: [teamId], references: [id])
  tasks       Task[]
  attendances Attendance[]

  @@unique([teamId, year, weekNumber])
  @@map("weekly_reports")
}

model Task {
  id              String   @id @default(uuid())
  weeklyReportId  String   @map("weekly_report_id")
  chainId         String   @map("chain_id")
  title           String
  purpose         String?
  startDate       DateTime? @map("start_date") @db.Date
  endDate         DateTime? @map("end_date") @db.Date
  totalCount      Int      @default(0) @map("total_count")
  completedCount  Int      @default(0) @map("completed_count")
  progress        Int      @default(0)
  thisWeekContent String?  @map("this_week_content")
  nextWeekContent String?  @map("next_week_content")
  displayOrder    Int      @default(0) @map("display_order")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  weeklyReport WeeklyReport   @relation(fields: [weeklyReportId], references: [id], onDelete: Cascade)
  chain        Chain          @relation(fields: [chainId], references: [id])
  assignees    TaskAssignee[]

  @@map("tasks")
}

model TaskAssignee {
  id     String @id @default(uuid())
  taskId String @map("task_id")
  userId String @map("user_id")

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id])

  @@unique([taskId, userId])
  @@map("task_assignees")
}

model AttendanceType {
  id         String             @id @default(uuid())
  code       String             @unique
  name       String
  category   AttendanceCategory
  isLongTerm Boolean            @default(false) @map("is_long_term")
  isActive   Boolean            @default(true) @map("is_active")
  createdAt  DateTime           @default(now()) @map("created_at")
  updatedAt  DateTime           @updatedAt @map("updated_at")

  attendances Attendance[]

  @@map("attendance_types")
}

model Attendance {
  id             String   @id @default(uuid())
  weeklyReportId String   @map("weekly_report_id")
  userId         String   @map("user_id")
  typeId         String   @map("type_id")
  content        String?
  startDate      DateTime @map("start_date") @db.Date
  endDate        DateTime @map("end_date") @db.Date
  location       String?
  remarks        String?
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  weeklyReport WeeklyReport   @relation(fields: [weeklyReportId], references: [id], onDelete: Cascade)
  user         User           @relation(fields: [userId], references: [id])
  type         AttendanceType @relation(fields: [typeId], references: [id])

  @@map("attendances")
}
```

---

## 변경 이력

| 버전 | 날짜 | 내용 |
|------|------|------|
| 1.0 | 2026-01-07 | 최초 작성 |
