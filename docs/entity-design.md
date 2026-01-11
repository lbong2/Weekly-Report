# 주간보고 시스템 - 엔터티 설계서

## 개요

SM 프로젝트 주간보고서를 웹에서 작성하고, PPT 파일로 자동 생성하는 시스템의 데이터베이스 설계 문서입니다.

- **기술 스택**: Nest.js (백엔드) + Next.js (프론트엔드) + PostgreSQL (DB)
- **예상 사용자**: 약 10명 (포항운영팀)

---

## ERD 개요

```
User ──────┬──────── Team
  │        │
  │        │
  ▼        ▼
TaskAssignee    WeeklyReport ◄─────── Attendance
  │                  │                    │
  │                  │                    │
  ▼                  ▼                    ▼
Task ◄────────── Chain            AttendanceType
```

---

## 엔터티 상세

### 1. User (사용자)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 (로그인 ID) |
| password | VARCHAR(255) | NOT NULL | 비밀번호 (해시) |
| name | VARCHAR(100) | NOT NULL | 이름 |
| team_id | UUID | FK (Team) | 소속 팀 |
| role | ENUM | NOT NULL, DEFAULT 'USER' | USER / ADMIN |
| created_at | TIMESTAMP | NOT NULL | 생성일시 |
| updated_at | TIMESTAMP | NOT NULL | 수정일시 |

---

### 2. Team (팀)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| name | VARCHAR(100) | NOT NULL | 팀명 (예: 포항운영팀) |
| location | VARCHAR(100) | | 위치 (예: 포항) |
| total_members | INT | DEFAULT 0 | 총 인원 (수동 관리) |
| created_at | TIMESTAMP | NOT NULL | 생성일시 |
| updated_at | TIMESTAMP | NOT NULL | 수정일시 |

---

### 3. Chain (모듈/체인)

업무 분류 코드입니다. 관리자가 추가/수정/삭제할 수 있습니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| code | VARCHAR(50) | UNIQUE, NOT NULL | 코드 (예: D_MEGA_BEAM) |
| name | VARCHAR(100) | NOT NULL | 표시명 (예: D-Mega Beam) |
| is_active | BOOLEAN | DEFAULT true | 활성화 여부 |
| created_at | TIMESTAMP | NOT NULL | 생성일시 |
| updated_at | TIMESTAMP | NOT NULL | 수정일시 |

**초기 데이터:**

| code | name |
|------|------|
| D_MEGA_BEAM | D-Mega Beam |
| PROCESS_PLAN | 공정계획 |
| OPERATION_MGMT | 조업관리 |
| OPERATION_REPORT | 조업진행 Report |

---

### 4. WeeklyReport (주간보고서)

팀 단위로 주차별 생성되는 보고서입니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| team_id | UUID | FK (Team), NOT NULL | 소속 팀 |
| year | INT | NOT NULL | 연도 (예: 2026) |
| week_number | INT | NOT NULL | 주차 (예: 2) |
| week_start | DATE | NOT NULL | 금주 시작일 (예: 2026-01-05) |
| week_end | DATE | NOT NULL | 금주 종료일 (예: 2026-01-09) |
| status | ENUM | DEFAULT 'DRAFT' | DRAFT / COMPLETED |
| created_at | TIMESTAMP | NOT NULL | 생성일시 |
| updated_at | TIMESTAMP | NOT NULL | 수정일시 |

**유니크 제약**: (team_id, year, week_number)

---

### 5. Task (업무 항목)

주간보고서에 포함되는 개별 업무 실적/계획입니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| weekly_report_id | UUID | FK (WeeklyReport), NOT NULL | 소속 주간보고서 |
| chain_id | UUID | FK (Chain), NOT NULL | 모듈/체인 |
| title | VARCHAR(255) | NOT NULL | 업무명 |
| purpose | TEXT | | 목적 |
| start_date | DATE | | 일정 시작일 |
| end_date | DATE | | 일정 종료일 |
| total_count | INT | DEFAULT 0 | 총본수 |
| completed_count | INT | DEFAULT 0 | 완료누계 |
| progress | INT | DEFAULT 0 | 진척률 (%) |
| this_week_content | TEXT | | 금주 수행실적 (마크다운) |
| next_week_content | TEXT | | 차주 수행계획 (마크다운) |
| display_order | INT | DEFAULT 0 | 슬라이드 내 정렬 순서 |
| created_at | TIMESTAMP | NOT NULL | 생성일시 |
| updated_at | TIMESTAMP | NOT NULL | 수정일시 |

**마크다운 형식 예시:**
```markdown
- 적재위치별 재고 현황
  - 화면 UI 구성 및 재고 쿼리 분석
- 작업 실적 조회
  - 화면 UI 구성 및 재고 쿼리 분석
```

PPT 생성 시 bullet 계층으로 변환됩니다.

---

### 6. TaskAssignee (업무 담당자)

Task와 User의 N:M 관계를 위한 매핑 테이블입니다. (협업 개발 지원)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| task_id | UUID | FK (Task), NOT NULL | 업무 |
| user_id | UUID | FK (User), NOT NULL | 담당자 |

**유니크 제약**: (task_id, user_id)

---

### 7. AttendanceType (출결 유형)

출결 분류 코드입니다. 관리자가 추가/수정/삭제할 수 있습니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| code | VARCHAR(50) | UNIQUE, NOT NULL | 코드 |
| name | VARCHAR(100) | NOT NULL | 표시명 |
| category | ENUM | NOT NULL | LEAVE (휴가) / BUSINESS_TRIP (출장) |
| is_long_term | BOOLEAN | DEFAULT false | 장기 여부 |
| is_active | BOOLEAN | DEFAULT true | 활성화 여부 |
| created_at | TIMESTAMP | NOT NULL | 생성일시 |
| updated_at | TIMESTAMP | NOT NULL | 수정일시 |

**초기 데이터:**

| code | name | category | is_long_term |
|------|------|----------|--------------|
| ANNUAL | 연차 | LEAVE | false |
| SICK | 병가 | LEAVE | false |
| FAMILY_EVENT | 경조휴가 | LEAVE | false |
| MATERNITY | 출산휴가 | LEAVE | true |
| PARENTAL | 육아휴직 | LEAVE | true |
| TRAINING | 훈련 | LEAVE | false |
| BUSINESS_TRIP | 출장 | BUSINESS_TRIP | false |
| LONG_BUSINESS_TRIP | 장기출장 | BUSINESS_TRIP | true |

---

### 8. Attendance (출결 기록)

개별 출결 기록입니다. 주간보고서의 인원현황 슬라이드에 사용됩니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 고유 식별자 |
| weekly_report_id | UUID | FK (WeeklyReport), NOT NULL | 소속 주간보고서 |
| user_id | UUID | FK (User), NOT NULL | 대상자 |
| type_id | UUID | FK (AttendanceType), NOT NULL | 출결 유형 |
| content | VARCHAR(255) | | 내용 (예: 스틸샵 시스템 업무 회의) |
| start_date | DATE | NOT NULL | 시작일 |
| end_date | DATE | NOT NULL | 종료일 |
| location | VARCHAR(100) | | 장소 (예: 본사) |
| remarks | VARCHAR(255) | | 비고 |
| created_at | TIMESTAMP | NOT NULL | 생성일시 |
| updated_at | TIMESTAMP | NOT NULL | 수정일시 |

---

## 인원 계산 로직

```
총 인원 = Team.total_members
현재 인원 = 총 인원 - (해당 주간에 is_long_term = true인 Attendance 수)
```

---

## PPT 슬라이드 생성 규칙

### 슬라이드 타입 1: 업무 실적/계획

- Task 2개당 슬라이드 1장
- 좌측: 금주 실적 (this_week_content)
- 우측: 차주 계획 (next_week_content)
- 담당자가 N명일 경우 콤마로 구분 표시

### 슬라이드 타입 2: 인원현황

- 팀당 1장 (맨 마지막)
- 1.인원현황: 총인원 / 현재인원
- 2.교육/출장: 해당 주간 Attendance 중 TRAINING, BUSINESS_TRIP
- 3.휴가/훈련: 해당 주간 Attendance 중 LEAVE 카테고리

---

## 변경 이력

| 버전 | 날짜 | 내용 |
|------|------|------|
| 1.0 | 2026-01-07 | 최초 작성 |
