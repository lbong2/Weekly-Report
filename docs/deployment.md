# 배포 가이드 (Docker 중심)

이 문서는 주간보고 시스템을 다른 컴퓨터(서버)에 배포하는 방법을 정리합니다.

---

## 1) 사전 준비
- Docker / Docker Compose 설치
- 도메인/방화벽 포트 오픈 (예: 3001, 4000, 5432 등)
- 저장소 코드 체크아웃

---

## 2) 환경 변수

### 백엔드 (`apps/backend/.env`)
```
# Database
DATABASE_URL="postgresql://postgres:postgres@db:5432/weekly_report?schema=public"

# JWT
JWT_SECRET=7c94171075089c9e2dcf22f485ecf8ba426a857cedc9aa6bb0f6562dbff96bc4
JWT_EXPIRES_IN=7d

# App
PORT=4000
FRONTEND_URL=http://localhost:3001

# Node
NODE_ENV=production
```

### 프론트엔드 (`apps/frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

운영 배포 시 `FRONTEND_URL`, `NEXT_PUBLIC_API_URL`은 실제 도메인으로 변경합니다.

---

## 3) Docker Compose 예시

> 아래는 예시 구성입니다. 필요한 경우 경로/포트/볼륨을 조정하세요.

### `docker-compose.yml` (루트 기준)
```
version: "3.8"

services:
  db:
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

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    container_name: weekly-report-backend
    env_file:
      - apps/backend/.env
    ports:
      - "4000:4000"
    depends_on:
      - db

  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile
    container_name: weekly-report-frontend
    env_file:
      - apps/frontend/.env.local
    ports:
      - "3001:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## 4) Dockerfile 예시

### `apps/backend/Dockerfile`
```
FROM node:20-alpine
WORKDIR /app

# 루트 패키지 복사
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend ./apps/backend
COPY packages ./packages

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/backend
RUN pnpm prisma:generate
RUN pnpm build

EXPOSE 4000
CMD ["pnpm", "start:prod"]
```

### `apps/frontend/Dockerfile`
```
FROM node:20-alpine
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/frontend ./apps/frontend
COPY packages ./packages

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/frontend
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
```

---

## 5) 초기화 / 마이그레이션

컨테이너 실행 후 DB 마이그레이션을 수행합니다.

```
docker compose up -d
docker compose exec backend pnpm prisma:migrate
```

시드 데이터가 필요하면:
```
docker compose exec backend pnpm prisma:seed
```

---

## 6) 실행 확인
- 프론트: `http://localhost:3001`
- 백엔드: `http://localhost:4000/api/v1`

---

## 7) 운영 팁
- `JWT_SECRET`은 반드시 운영 전용 값으로 교체
- DB 백업 정책 적용
- `NODE_ENV=production` 적용 확인
- 리버스 프록시(Nginx 등) 사용 시 `/api/v1` 프록시 설정

---

## 8) 도메인 없이 IP로 접속하는 경우
도메인이 없어도 됩니다. 사내 서버 IP로 접속하면 됩니다.

예시:
- 프론트: `http://10.0.0.12:3001`
- 백엔드: `http://10.0.0.12:4000/api/v1`

이 경우 환경 변수만 실제 IP로 맞춰주세요.

### 백엔드 (`apps/backend/.env`)
```
FRONTEND_URL=http://10.0.0.12:3001
```

### 프론트엔드 (`apps/frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://10.0.0.12:4000/api/v1
```

방화벽에서 3001/4000 포트를 열어두면 접속 가능합니다.
