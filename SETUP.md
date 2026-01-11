# 주간보고 시스템 설치 및 실행 가이드

## 사전 요구사항

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+
- Docker & Docker Compose (선택사항 - PostgreSQL 실행용)

---

## 1. 의존성 설치

### 1.1 pnpm 설치 (필요한 경우)

```bash
npm install -g pnpm
```

### 1.2 프로젝트 의존성 설치

```bash
# 프로젝트 루트에서 실행
pnpm install
```

---

## 2. 데이터베이스 설정

### 2.1 Docker로 PostgreSQL 실행 (권장)

```bash
docker-compose up -d
```

PostgreSQL이 `localhost:5432`에서 실행됩니다.

### 2.2 환경 변수 설정

`.env` 파일이 이미 생성되어 있습니다. 필요시 수정하세요:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/weekly_report?schema=public"
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=4000
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NODE_ENV=development
```

**중요**: 프로덕션 환경에서는 `JWT_SECRET`을 반드시 변경하세요!

---

## 3. 데이터베이스 마이그레이션 및 Seed

### 3.1 Prisma Client 생성

```bash
cd apps/backend
pnpm prisma:generate
```

### 3.2 마이그레이션 실행

```bash
# 개발 환경
pnpm prisma:migrate:dev

# 프로덕션 환경
pnpm prisma:migrate
```

### 3.3 초기 데이터 삽입 (Seed)

```bash
pnpm prisma:seed
```

**기본 계정 정보**:
- 관리자: `admin@company.com` / `admin123`
- 일반 사용자: `hong@company.com` / `password123`

**초기 데이터**:
- 팀: 포항운영팀 (10명)
- 모듈(Chain): D-Mega Beam, 공정계획, 조업관리, 조업진행 Report
- 출결 유형: 연차, 병가, 경조휴가, 출산휴가, 육아휴직, 훈련, 출장, 장기출장

---

## 4. 개발 서버 실행

### 4.1 백엔드만 실행

```bash
cd apps/backend
pnpm dev
```

또는 루트에서:

```bash
pnpm dev:backend
```

백엔드는 `http://localhost:4000`에서 실행됩니다.

### 4.2 프론트엔드만 실행 (추후)

```bash
cd apps/frontend
pnpm dev
```

또는 루트에서:

```bash
pnpm dev:frontend
```

### 4.3 전체 실행

```bash
# 루트에서
pnpm dev
```

---

## 5. API 문서 확인

서버 실행 후 Swagger 문서 접속:

```
http://localhost:4000/api
```

---

## 6. 주요 API 엔드포인트

### 인증
- `POST /api/v1/auth/register` - 회원가입 (관리자만)
- `POST /api/v1/auth/login` - 로그인
- `GET /api/v1/auth/me` - 내 정보 조회

### 사용자
- `GET /api/v1/users` - 사용자 목록
- `POST /api/v1/users` - 사용자 생성 (관리자)
- `GET /api/v1/users/:id` - 사용자 조회
- `PATCH /api/v1/users/:id` - 사용자 수정 (관리자)
- `DELETE /api/v1/users/:id` - 사용자 삭제 (관리자)

### 팀
- `GET /api/v1/teams` - 팀 목록
- `POST /api/v1/teams` - 팀 생성 (관리자)
- `GET /api/v1/teams/:id` - 팀 조회
- `PATCH /api/v1/teams/:id` - 팀 수정 (관리자)
- `DELETE /api/v1/teams/:id` - 팀 삭제 (관리자)

### 모듈(Chain)
- `GET /api/v1/chains` - 모듈 목록
- `POST /api/v1/chains` - 모듈 생성 (관리자)
- `GET /api/v1/chains/:id` - 모듈 조회
- `PATCH /api/v1/chains/:id` - 모듈 수정 (관리자)
- `DELETE /api/v1/chains/:id` - 모듈 삭제 (관리자)

### 출결 유형
- `GET /api/v1/attendance-types` - 출결 유형 목록
- `POST /api/v1/attendance-types` - 출결 유형 생성 (관리자)
- `GET /api/v1/attendance-types/:id` - 출결 유형 조회
- `PATCH /api/v1/attendance-types/:id` - 출결 유형 수정 (관리자)
- `DELETE /api/v1/attendance-types/:id` - 출결 유형 삭제 (관리자)

### 주간보고서
- `GET /api/v1/weekly-reports` - 주간보고서 목록
- `POST /api/v1/weekly-reports` - 주간보고서 생성
- `GET /api/v1/weekly-reports/:id` - 주간보고서 상세 조회
- `PATCH /api/v1/weekly-reports/:id` - 주간보고서 수정
- `DELETE /api/v1/weekly-reports/:id` - 주간보고서 삭제

### 업무(Task)
- `GET /api/v1/tasks?weeklyReportId=:id` - 업무 목록
- `POST /api/v1/tasks` - 업무 생성
- `GET /api/v1/tasks/:id` - 업무 조회
- `PATCH /api/v1/tasks/:id` - 업무 수정
- `DELETE /api/v1/tasks/:id` - 업무 삭제

### 출결(Attendance)
- `GET /api/v1/attendances?weeklyReportId=:id` - 출결 목록
- `POST /api/v1/attendances` - 출결 생성
- `GET /api/v1/attendances/:id` - 출결 조회
- `PATCH /api/v1/attendances/:id` - 출결 수정
- `DELETE /api/v1/attendances/:id` - 출결 삭제

---

## 7. 데이터베이스 관리

### Prisma Studio 실행 (GUI)

```bash
cd apps/backend
pnpm prisma:studio
```

`http://localhost:5555`에서 데이터베이스를 GUI로 관리할 수 있습니다.

### 마이그레이션 관리

```bash
# 새로운 마이그레이션 생성
pnpm prisma:migrate:dev

# 마이그레이션 상태 확인
npx prisma migrate status

# 데이터베이스 초기화 (개발용 - 모든 데이터 삭제)
pnpm prisma:reset
```

---

## 8. 빌드

### 백엔드 빌드

```bash
cd apps/backend
pnpm build
```

빌드된 파일은 `apps/backend/dist`에 생성됩니다.

### 프로덕션 실행

```bash
cd apps/backend
pnpm start:prod
```

---

## 9. 트러블슈팅

### 포트 충돌

다른 서비스가 4000포트를 사용 중이면 `.env`에서 `PORT`를 변경하세요.

### 데이터베이스 연결 실패

1. PostgreSQL이 실행 중인지 확인
2. `.env`의 `DATABASE_URL` 확인
3. 방화벽 설정 확인

### Prisma 클라이언트 에러

```bash
cd apps/backend
pnpm prisma:generate
```

---

## 10. 다음 단계

- [x] 백엔드 API 구현 완료
- [ ] 프론트엔드 구현
- [ ] PPT 내보내기 기능 구현 (핵심!)
- [ ] 배포 설정

---

## 문의

프로젝트 관련 문의는 이슈 트래커를 이용해주세요.
