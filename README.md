# 주간보고 시스템 (Weekly Report System)

SM 프로젝트 주간보고서를 웹에서 작성하고 PPT 파일로 자동 생성하는 시스템입니다.

---

## 📌 목차

1. [소개](#1-소개)
2. [기술 스택](#2-기술-스택)
3. [시스템 요구사항](#3-시스템-요구사항)
4. [프로젝트 구조](#4-프로젝트-구조)
5. [주요 기능](#5-주요-기능)
6. [데이터 모델](#6-데이터-모델)
7. [배포 가이드](#7-배포-가이드)
8. [기본 계정 정보](#8-기본-계정-정보)
9. [라이선스](#9-라이선스)

---

## 1. 소개

주간보고 시스템은 팀 단위로 주간 업무를 관리하고, 보고서를 생성하여 PPT로 내보낼 수 있는 웹 애플리케이션입니다.

### 핵심 기능
- 📊 **주간보고서 관리**: 주차별 업무 현황 작성 및 관리
- 📋 **장기 업무(이슈) 관리**: 여러 주에 걸친 장기 업무 추적
- 📥 **PPT 내보내기**: 작성된 보고서를 PPT 파일로 자동 생성
- 👥 **인원현황 관리**: 팀원 출결/출장 현황 관리
- ⚙️ **관리자 기능**: 사용자, 팀, 모듈 관리

---

## 2. 기술 스택

| 구분 | 기술 |
|------|------|
| **Backend** | Nest.js (TypeScript), Prisma ORM |
| **Frontend** | Next.js 15 (App Router, TypeScript), Tailwind CSS |
| **Database** | PostgreSQL 15+ |
| **인증** | JWT (passport-jwt) |
| **상태관리** | Zustand |
| **PPT 생성** | pptxgenjs |
| **패키지 관리** | pnpm (monorepo workspace) |
| **빌드 도구** | Turbo |
| **컨테이너** | Docker, Docker Compose |

---

## 3. 시스템 요구사항

### 개발 환경
- Node.js 20.0.0 이상
- pnpm 9.0.0 이상
- Docker & Docker Compose

### 프로덕션 환경 (Docker 배포 시)
- Docker & Docker Compose만 필요

---

## 4. 프로젝트 구조

```
weekly-report/
├── apps/
│   ├── backend/              # Nest.js API 서버
│   │   ├── prisma/           # DB 스키마 및 마이그레이션
│   │   ├── src/
│   │   │   ├── auth/         # 인증 모듈
│   │   │   ├── users/        # 사용자 관리
│   │   │   ├── teams/        # 팀 관리
│   │   │   ├── chains/       # 모듈(Chain) 관리
│   │   │   ├── weekly-reports/ # 주간보고서
│   │   │   ├── tasks/        # 업무(Task)
│   │   │   ├── issues/       # 장기 업무(Issue)
│   │   │   ├── attendances/  # 인원현황
│   │   │   └── attendance-types/ # 출결 유형
│   │   └── Dockerfile
│   │
│   └── frontend/             # Next.js 웹 클라이언트
│       ├── src/
│       │   ├── app/          # 페이지 (App Router)
│       │   │   ├── (admin)/  # 관리자 페이지
│       │   │   ├── (main)/   # 일반 사용자 페이지
│       │   │   └── (auth)/   # 로그인 페이지
│       │   ├── components/   # 재사용 컴포넌트
│       │   ├── lib/          # API 클라이언트, 훅, 스토어
│       │   └── types/        # TypeScript 타입 정의
│       └── Dockerfile
│
├── docker-compose.yml        # Docker 컨테이너 설정
├── package.json              # 루트 패키지 (스크립트)
├── pnpm-workspace.yaml       # pnpm 워크스페이스 설정
└── turbo.json                # Turbo 빌드 설정
```

---

## 5. 주요 기능

### 5.1 주간보고서 관리
- 주차별 보고서 생성/조회/수정/삭제
- 모듈(Chain)별 업무 분류
- 금주/차주 실적 및 계획 작성
- 담당자 지정
- **PPT 내보내기**

### 5.2 장기 업무(이슈) 관리
- 여러 주에 걸친 업무를 이슈로 등록
- 진척률 자동 계산
- 이슈 상태 관리 (대기/진행중/완료/보류)
- 주간보고서 작성 시 진행중인 이슈 자동 포함

### 5.3 인원현황 관리
- 휴가, 출장, 교육 등 출결 현황 관리
- 장기 출결 구분 (육아휴직, 장기출장 등)

### 5.4 관리자 기능
- **사용자 관리**: 계정 생성, 권한/직책 설정
- **팀 관리**: 팀 생성 및 인원 관리
- **모듈 관리**: 업무 분류(Chain) 관리, 드래그앤드롭 순서 변경
- **출결 유형 관리**: 휴가/출장 유형 관리

---

## 6. 데이터 모델

### ERD (Entity Relationship Diagram)

[ERD 다이어그램 보기](https://dbdiagram.io/d/6963501ad6e030a024ac7610)

### 주요 엔터티 설명

| 엔터티 | 설명 |
|--------|------|
| **User** | 사용자 (권한: USER/ADMIN, 직책: 사원/매니저/팀장) |
| **Team** | 팀 |
| **Chain** | 모듈 (업무 분류 단위, 드래그앤드롭 순서 변경 가능) |
| **WeeklyReport** | 주간보고서 |
| **Task** | 업무 (주간보고서에 포함) |
| **Issue** | 장기 업무 (여러 주간보고서에 걸침) |
| **Attendance** | 인원현황 (휴가/출장) |
| **AttendanceType** | 출결 유형 |

---

## 7. 배포 가이드

### 7.1 사전 준비

**필수 설치:**
- Docker
- Docker Compose

### 7.2 프로젝트 다운로드

```bash
# Git Clone
git clone <repository-url>
cd weekly-report
```

### 7.3 환경 변수 설정

**1) 백엔드 환경 변수**

```bash
cp .env.example apps/backend/.env
```

`apps/backend/.env` 파일 수정:
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/weekly_report?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=4000
NODE_ENV=production
```

> ⚠️ **주의**: `JWT_SECRET`은 반드시 안전한 값으로 변경하세요!

**2) 프론트엔드 환경 변수**

```bash
cp .env.example apps/frontend/.env
```

`apps/frontend/.env` 파일 수정:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

> 만약 다른 서버에 배포한다면 `localhost`를 해당 서버 IP 또는 도메인으로 변경하세요.

### 7.4 Docker 이미지 빌드 및 실행

```bash
# 이미지 빌드
docker-compose build

# 컨테이너 실행 (백그라운드)
docker-compose up -d
```

### 7.5 데이터베이스 초기화 (최초 1회)

```bash
# 마이그레이션 실행
docker-compose exec backend npx prisma migrate deploy

# 초기 데이터(시드) 삽입
docker-compose exec backend npx prisma db seed
```

### 7.6 접속 확인

| 서비스 | URL |
|--------|-----|
| 프론트엔드 | http://localhost:3000 |
| 백엔드 API | http://localhost:4000 |
| Swagger 문서 | http://localhost:4000/api |

### 7.7 컨테이너 관리

```bash
# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f           # 전체
docker-compose logs -f backend   # 백엔드만
docker-compose logs -f frontend  # 프론트엔드만

# 중지
docker-compose down

# 중지 + 볼륨 삭제 (DB 데이터 초기화)
docker-compose down -v
```

### 7.8 코드 수정 후 재배포

> ⚠️ **중요**: Docker 환경에서는 코드 수정 시 이미지를 재빌드해야 합니다!

```bash
# 1. 컨테이너 중지
docker-compose down

# 2. 새 패키지 추가 시 (선택)
pnpm install

# 3. 이미지 재빌드
docker-compose build

# 4. 컨테이너 재시작
docker-compose up -d
```

### 7.9 다른 서버에 배포하기

다른 컴퓨터/서버에 배포할 때:

1. **Docker & Docker Compose만 설치**하면 됩니다 (Node.js 불필요)

2. 프로젝트 파일 전체를 복사하거나 Git Clone

3. 환경 변수 파일 설정:
   - `apps/backend/.env`
   - `apps/frontend/.env`

4. 빌드 및 실행:
   ```bash
   docker-compose build
   docker-compose up -d
   docker-compose exec backend npx prisma migrate deploy
   docker-compose exec backend npx prisma db seed
   ```

5. 포트 확인:
   - 3000 (프론트엔드)
   - 4000 (백엔드)
   - 5432 (PostgreSQL) - 외부 접근 필요시

---

## 8. 기본 계정 정보

### 관리자 계정
```
이메일: admin@dongkuk.com
비밀번호: dumes01
```
---

## 9. 라이선스

사내 시스템 (Private)

```bash
# 1. 환경 변수 파일 생성
cp .env.example apps/backend/.env
cp .env.example apps/frontend/.env
# 필요시 파일 수정 (JWT_SECRET 등)

# 2. 빌드
docker-compose build

# 3. 실행
docker-compose up -d

# 4. DB 마이그레이션 (스키마 적용)
docker-compose exec backend npx prisma migrate deploy

# 5. 초기 데이터 삽입 (관리자 계정 등)
docker-compose exec backend npx prisma db seed
```
업데이트 시 
```bash
git pull
docker-compose build
docker-compose up -d
# 마이그레이션 변경이 있으면
docker-compose exec backend npx prisma migrate deploy
```