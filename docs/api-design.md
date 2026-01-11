# 주간보고 시스템 - API 설계서

## 개요

SM 프로젝트 주간보고서 웹 시스템의 REST API 설계 문서입니다.

- **Base URL**: `/api/v1`
- **인증 방식**: JWT (Bearer Token)
- **Content-Type**: `application/json`

---

## 인증 헤더

```
Authorization: Bearer <accessToken>
```

---

## 공통 응답 형식

### 성공 응답

```json
{
  "data": { ... },
  "message": "성공 메시지"
}
```

### 목록 응답 (페이지네이션)

```json
{
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### 에러 응답

```json
{
  "statusCode": 400,
  "message": "에러 메시지",
  "error": "Bad Request"
}
```

---

## API 목록

### 1. 인증 (Auth)

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | /auth/login | 로그인 | - |
| POST | /auth/logout | 로그아웃 | USER |
| GET | /auth/me | 내 정보 조회 | USER |

---

### 2. 사용자 (Users)

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | /users | 사용자 목록 | ADMIN |
| GET | /users/:id | 사용자 상세 | ADMIN |
| POST | /users | 사용자 생성 | ADMIN |
| PATCH | /users/:id | 사용자 수정 | ADMIN |
| DELETE | /users/:id | 사용자 삭제 | ADMIN |
| GET | /users/team/:teamId | 팀원 목록 | USER |

---

### 3. 팀 (Teams)

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | /teams | 팀 목록 | ADMIN |
| GET | /teams/:id | 팀 상세 | USER |
| POST | /teams | 팀 생성 | ADMIN |
| PATCH | /teams/:id | 팀 수정 | ADMIN |
| DELETE | /teams/:id | 팀 삭제 | ADMIN |

---

### 4. 모듈/체인 (Chains)

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | /chains | 모듈 목록 | USER |
| GET | /chains/:id | 모듈 상세 | USER |
| POST | /chains | 모듈 생성 | ADMIN |
| PATCH | /chains/:id | 모듈 수정 | ADMIN |
| DELETE | /chains/:id | 모듈 삭제 | ADMIN |

---

### 5. 주간보고서 (Weekly Reports)

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | /weekly-reports | 주간보고서 목록 | USER |
| GET | /weekly-reports/:id | 주간보고서 상세 | USER |
| POST | /weekly-reports | 주간보고서 생성 | USER |
| PATCH | /weekly-reports/:id | 주간보고서 수정 | USER |
| DELETE | /weekly-reports/:id | 주간보고서 삭제 | USER |
| GET | /weekly-reports/:id/export/pptx | PPT 내보내기 | USER |

---

### 6. 업무 (Tasks)

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | /weekly-reports/:reportId/tasks | 업무 목록 | USER |
| GET | /tasks/:id | 업무 상세 | USER |
| POST | /weekly-reports/:reportId/tasks | 업무 생성 | USER |
| PATCH | /tasks/:id | 업무 수정 | USER |
| DELETE | /tasks/:id | 업무 삭제 | USER |

---

### 7. 출결 유형 (Attendance Types)

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | /attendance-types | 출결 유형 목록 | USER |
| GET | /attendance-types/:id | 출결 유형 상세 | USER |
| POST | /attendance-types | 출결 유형 생성 | ADMIN |
| PATCH | /attendance-types/:id | 출결 유형 수정 | ADMIN |
| DELETE | /attendance-types/:id | 출결 유형 삭제 | ADMIN |

---

### 8. 출결 (Attendances)

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | /weekly-reports/:reportId/attendances | 출결 목록 | USER |
| GET | /attendances/:id | 출결 상세 | USER |
| POST | /weekly-reports/:reportId/attendances | 출결 생성 | USER |
| PATCH | /attendances/:id | 출결 수정 | USER |
| DELETE | /attendances/:id | 출결 삭제 | USER |

---

## 상세 명세

### 1. 인증 API

#### POST /auth/login

로그인

**Request Body:**
```json
{
  "email": "hong@company.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "hong@company.com",
    "name": "홍길동",
    "role": "ADMIN",
    "team": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "포항운영팀",
      "location": "포항"
    }
  }
}
```

**Error (401):**
```json
{
  "statusCode": 401,
  "message": "이메일 또는 비밀번호가 올바르지 않습니다.",
  "error": "Unauthorized"
}
```

---

#### GET /auth/me

내 정보 조회

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "hong@company.com",
  "name": "홍길동",
  "role": "ADMIN",
  "team": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "포항운영팀",
    "location": "포항",
    "totalMembers": 8
  },
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

---

### 2. 사용자 API

#### POST /users

사용자 생성 (관리자 전용)

**Request Body:**
```json
{
  "email": "newuser@company.com",
  "password": "password123",
  "name": "신규사원",
  "teamId": "550e8400-e29b-41d4-a716-446655440001",
  "role": "USER"
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "email": "newuser@company.com",
  "name": "신규사원",
  "role": "USER",
  "team": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "포항운영팀"
  },
  "createdAt": "2026-01-07T10:00:00Z",
  "updatedAt": "2026-01-07T10:00:00Z"
}
```

---

#### GET /users/team/:teamId

팀원 목록 조회

**Response (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "홍길동",
      "email": "hong@company.com",
      "role": "ADMIN"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "손병진",
      "email": "son@company.com",
      "role": "USER"
    }
  ]
}
```

---

### 3. 주간보고서 API

#### GET /weekly-reports

주간보고서 목록 조회

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| page | number | X | 페이지 번호 (기본값: 1) |
| limit | number | X | 페이지당 개수 (기본값: 20) |
| year | number | X | 연도 필터 |
| teamId | string | X | 팀 필터 |

**Response (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "year": 2026,
      "weekNumber": 2,
      "weekStart": "2026-01-05",
      "weekEnd": "2026-01-09",
      "status": "DRAFT",
      "team": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "포항운영팀"
      },
      "taskCount": 12,
      "attendanceCount": {
        "leave": 3,
        "businessTrip": 2
      },
      "createdAt": "2026-01-05T09:00:00Z",
      "updatedAt": "2026-01-07T10:00:00Z"
    }
  ],
  "meta": {
    "total": 52,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

#### POST /weekly-reports

주간보고서 생성

**Request Body:**
```json
{
  "year": 2026,
  "weekNumber": 2,
  "weekStart": "2026-01-05",
  "weekEnd": "2026-01-09"
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440100",
  "year": 2026,
  "weekNumber": 2,
  "weekStart": "2026-01-05",
  "weekEnd": "2026-01-09",
  "status": "DRAFT",
  "team": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "포항운영팀"
  },
  "createdAt": "2026-01-07T10:00:00Z",
  "updatedAt": "2026-01-07T10:00:00Z"
}
```

---

#### GET /weekly-reports/:id

주간보고서 상세 조회

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440100",
  "year": 2026,
  "weekNumber": 2,
  "weekStart": "2026-01-05",
  "weekEnd": "2026-01-09",
  "status": "DRAFT",
  "team": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "포항운영팀",
    "location": "포항",
    "totalMembers": 8
  },
  "tasks": [
    {
      "id": "...",
      "chain": { "id": "...", "code": "D_MEGA_BEAM", "name": "D-Mega Beam" },
      "title": "재고현황 및 작업 실적 조회 화면 개발",
      "assignees": [{ "id": "...", "name": "이창근 매니저" }],
      "progress": 10
    }
  ],
  "attendances": [
    {
      "id": "...",
      "user": { "id": "...", "name": "손병진 팀장" },
      "type": { "id": "...", "code": "BUSINESS_TRIP", "name": "출장" },
      "startDate": "2026-01-06",
      "endDate": "2026-01-07"
    }
  ],
  "createdAt": "2026-01-05T09:00:00Z",
  "updatedAt": "2026-01-07T10:00:00Z"
}
```

---

#### GET /weekly-reports/:id/export/pptx

PPT 내보내기

**Response Headers:**
```
Content-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation
Content-Disposition: attachment; filename="주간보고서_포항운영팀_2026년_2주차.pptx"
```

**Response Body:** PPT 파일 바이너리

---

### 4. 업무 API

#### GET /weekly-reports/:reportId/tasks

업무 목록 조회

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| chainId | string | X | 모듈 필터 |
| assigneeId | string | X | 담당자 필터 |

**Response (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440200",
      "chain": {
        "id": "550e8400-e29b-41d4-a716-446655440050",
        "code": "D_MEGA_BEAM",
        "name": "D-Mega Beam"
      },
      "title": "재고현황 및 작업 실적 조회 화면 개발",
      "purpose": "재고현황 및 자재별 수불 내역을 파악하기 위해 프로그램 개발",
      "startDate": "2026-01-09",
      "endDate": "2026-01-30",
      "assignees": [
        { "id": "...", "name": "이창근 매니저" }
      ],
      "totalCount": 2,
      "completedCount": 0,
      "progress": 0,
      "thisWeekContent": "- 적재위치별 재고 현황\n  - 화면 UI 구성 및 재고 쿼리 분석",
      "nextWeekContent": "- 적재위치별 재고 현황\n  - 재고 데이터 검증\n  - 프로그램 테스트",
      "displayOrder": 1,
      "createdAt": "2026-01-07T10:00:00Z",
      "updatedAt": "2026-01-07T10:00:00Z"
    }
  ]
}
```

---

#### POST /weekly-reports/:reportId/tasks

업무 생성

**Request Body:**
```json
{
  "chainId": "550e8400-e29b-41d4-a716-446655440050",
  "title": "재고현황 및 작업 실적 조회 화면 개발",
  "purpose": "재고현황 및 자재별 수불 내역을 파악하기 위해 프로그램 개발",
  "startDate": "2026-01-09",
  "endDate": "2026-01-30",
  "assigneeIds": ["550e8400-e29b-41d4-a716-446655440002"],
  "totalCount": 2,
  "completedCount": 0,
  "thisWeekContent": "- 적재위치별 재고 현황\n  - 화면 UI 구성 및 재고 쿼리 분석",
  "nextWeekContent": "- 적재위치별 재고 현황\n  - 재고 데이터 검증\n  - 프로그램 테스트"
}
```

**Response (201):** 생성된 Task 객체

---

#### PATCH /tasks/:id

업무 수정

**Request Body:** (변경할 필드만)
```json
{
  "completedCount": 1,
  "thisWeekContent": "- 적재위치별 재고 현황\n  - 화면 UI 구성 완료\n  - 재고 쿼리 분석 완료"
}
```

**Response (200):** 수정된 Task 객체

---

### 5. 출결 API

#### POST /weekly-reports/:reportId/attendances

출결 생성

**Request Body:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440002",
  "typeId": "550e8400-e29b-41d4-a716-446655440060",
  "startDate": "2026-01-06",
  "endDate": "2026-01-07",
  "content": "스틸샵 시스템 업무 회의",
  "location": "본사",
  "remarks": ""
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440300",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "손병진 팀장"
  },
  "type": {
    "id": "550e8400-e29b-41d4-a716-446655440060",
    "code": "BUSINESS_TRIP",
    "name": "출장",
    "category": "BUSINESS_TRIP",
    "isLongTerm": false
  },
  "startDate": "2026-01-06",
  "endDate": "2026-01-07",
  "content": "스틸샵 시스템 업무 회의",
  "location": "본사",
  "remarks": "",
  "createdAt": "2026-01-07T10:00:00Z",
  "updatedAt": "2026-01-07T10:00:00Z"
}
```

---

### 6. 모듈(Chain) API

#### GET /chains

모듈 목록 조회

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| isActive | boolean | X | 활성화 필터 (기본값: true) |

**Response (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440050",
      "code": "D_MEGA_BEAM",
      "name": "D-Mega Beam",
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440051",
      "code": "PROCESS_PLAN",
      "name": "공정계획",
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

#### POST /chains

모듈 생성 (관리자 전용)

**Request Body:**
```json
{
  "code": "NEW_MODULE",
  "name": "신규 모듈"
}
```

**Response (201):** 생성된 Chain 객체

---

### 7. 출결 유형 API

#### GET /attendance-types

출결 유형 목록 조회

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| category | string | X | LEAVE / BUSINESS_TRIP |
| isActive | boolean | X | 활성화 필터 |

**Response (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440060",
      "code": "ANNUAL",
      "name": "연차",
      "category": "LEAVE",
      "isLongTerm": false,
      "isActive": true
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440061",
      "code": "MATERNITY",
      "name": "출산휴가",
      "category": "LEAVE",
      "isLongTerm": true,
      "isActive": true
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440062",
      "code": "BUSINESS_TRIP",
      "name": "출장",
      "category": "BUSINESS_TRIP",
      "isLongTerm": false,
      "isActive": true
    }
  ]
}
```

---

## HTTP 상태 코드

| 코드 | 설명 |
|------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 (유효성 검사 실패) |
| 401 | 인증 실패 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 충돌 (중복 데이터) |
| 500 | 서버 에러 |

---

## 변경 이력

| 버전 | 날짜 | 내용 |
|------|------|------|
| 1.0 | 2026-01-07 | 최초 작성 |
