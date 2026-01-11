# 중간 점검 (Middle Check) - 이슈 관리 시스템

본 문서는 현재까지 진행된 **이슈 관리 시스템(Long-term Tasks)** 구현 내역과 주요 변경 사항, 그리고 해결된 문제점들을 정리합니다.

## 1. 주요 구현 기능

### 1.1. 백엔드 (Backend)
*   **데이터 모델링 (`schema.prisma`)**:
    *   `Issue` 모델 추가 (장기 업무 관리).
    *   `Task` 모델과 `Issue` 모델 1:1 관계 설정 (`issueId`).
*   **이슈 관리 모듈 (`IssuesModule`)**:
    *   CRUD API 구현 (`/api/v1/issues`).
    *   `create`, `findAll` (팀별 조회), `update`, `delete`.
*   **업무-이슈 자동 연동 (`TasksService`)**:
    *   **자동 생성**: 업무(`Task`) 생성 시 `issueId`가 없으면 자동으로 `Issue`를 생성하고 연결하는 트랜잭션 로직 구현.
    *   **상태 추적**: `Task` 조회 시 연결된 `Issue` 정보를 포함(`include: { issue: true }`)하여 프론트엔드에서 상태 확인 가능.

### 1.2. 프론트엔드 (Frontend)
*   **이슈 관리 페이지 (`/issues`)**:
    *   이슈 생성, 수정, 삭제 기능.
    *   진행중/완료/대기 등 상태 표시 및 진척률 시각화.
    *   `issuesApi` 클라이언트 적용으로 보안(JWT) 통신 보장.
*   **주간보고서 상세 페이지 (`/reports/[id]`)**:
    *   **이슈 종료 버튼**: 업무 목록에서 연결된 이슈가 있을 경우 "종료" 버튼 노출.
    *   **자동 연동**: 업무 추가 시 백엔드 로직을 통해 자동으로 이슈가 생성/연결됨을 확인.
    *   *(삭제됨) 이슈 승격 기능*: 기존 업무를 이슈로 변환하는 기능은 사용자 요청에 의해 제거됨.

## 2. 트러블슈팅 및 해결 내역

### 2.1. API 연결 및 네트워크
*   **`ECONNREFUSED` 문제**:
    *   백엔드: `0.0.0.0` 바인딩으로 외부 접속 허용.
    *   프론트엔드(Next.js Proxy): `127.0.0.1` 명시적 지정으로 IPv6/v4 충돌 방지.
*   **`Cannot POST /api/v1/issues`**:
    *   원인: `IssuesController` 파일은 생성되었으나 내부 메서드(`@Post`, `@Get` 등) 구현이 누락됨.
    *   해결: `IssuesService`와 연동하여 모든 CRUD 메서드 구현 완료.

### 2.2. 로직 및 호환성
*   **업무 추가 시 이슈 미생성**:
    *   원인: `TasksService.create` 메서드에서 이슈 생성 로직이 누락되어 있었음.
    *   해결: `Prisma.$transaction`을 사용하여 업무 생성 시 이슈가 없으면 자동으로 생성하도록 로직 재작성.
*   **이슈 목록 미표시**:
    *   원인: 프론트엔드 `fetch` 호출 시 인증 헤더(`Authorization`) 누락으로 401 에러 발생.
    *   해결: `axios` 기반의 인증된 클라이언트(`issuesApi`, `apiClient`)를 사용하도록 전면 리팩토링.
*   **타입 에러 (`UpdateTaskRequest`)**:
    *   `issueId` 필드 누락 및 `displayOrder` 중복 정의 수정.

## 3. 파일 변경 목록 (주요 파일)

### Backend
*   `apps/backend/src/issues/issues.controller.ts`: API 엔드포인트 구현 (수정 완료).
*   `apps/backend/src/issues/issues.service.ts`: 이슈 비즈니스 로직.
*   `apps/backend/src/tasks/tasks.service.ts`: 트랜잭션 기반 자동 이슈 생성 로직 추가.
*   `apps/backend/prisma/schema.prisma`: 스키마 정의.

### Frontend
*   `apps/frontend/src/app/(main)/reports/[id]/page.tsx`: 주간보고서 상세 (종료 버튼, 승격 기능 제거).
*   `apps/frontend/src/app/(dashboard)/issues/page.tsx`: 이슈 관리 목록 (API 클라이언트 교체).
*   `apps/frontend/src/components/reports/TaskList.tsx`: "종료" 버튼 UI.
*   `apps/frontend/src/types/api.ts`: API 타입 정의 (중복 제거 및 필드 추가).
*   `apps/frontend/src/lib/api/issues.ts`: 이슈 API 클라이언트.

## 4. 향후 계획
*   자동 생성된 이슈의 사후 관리 (이슈 관리 페이지에서 상세 정보 수정 등).
*   주간보고서 생성 시 '진행중'인 이슈들이 자동으로 '금주 계획' 등으로 불러와지는지 검증 (사용자 시나리오).
