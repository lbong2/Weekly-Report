# 주간보고 시스템 - 프론트엔드 구현 계획서

## 개요

Next.js 14 (App Router)를 사용한 주간보고 시스템 웹 클라이언트 구현 계획입니다.

**목표**: ui-design.md와 api-design.md를 기반으로 사용자 친화적이고 유지보수 가능한 프론트엔드 구축

---

## 기술 스택

| 분류 | 기술 | 버전 | 용도 |
|------|------|------|------|
| 프레임워크 | Next.js | 14+ | App Router, SSR, API Routes |
| 언어 | TypeScript | 5.x | 타입 안정성 |
| 스타일링 | Tailwind CSS | 3.x | 유틸리티 CSS |
| UI 라이브러리 | shadcn/ui | latest | 재사용 가능한 컴포넌트 |
| 상태관리 | Zustand | 4.x | 경량 상태 관리 |
| HTTP 클라이언트 | Axios | 1.x | API 통신 |
| 폼 관리 | React Hook Form | 7.x | 폼 상태 관리 및 유효성 검사 |
| 유효성 검사 | Zod | 3.x | 스키마 기반 검증 |
| 날짜 처리 | date-fns | 2.x | 날짜 포맷팅 및 계산 |
| 에디터 | React Textarea Autosize | 8.x | 마크다운 입력 |

---

## 프로젝트 구조

```
apps/frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/          # 로그인 페이지
│   │   ├── (main)/
│   │   │   ├── page.tsx        # 주간보고서 목록 (메인)
│   │   │   ├── reports/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # 주간보고서 상세
│   │   │   └── admin/          # 관리자 페이지
│   │   │       ├── users/
│   │   │       ├── teams/
│   │   │       ├── chains/
│   │   │       └── attendance-types/
│   │   ├── layout.tsx          # Root 레이아웃
│   │   ├── error.tsx           # 에러 페이지
│   │   └── not-found.tsx       # 404 페이지
│   │
│   ├── components/             # 컴포넌트
│   │   ├── ui/                 # shadcn/ui 기본 컴포넌트
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── layout/             # 레이아웃 컴포넌트
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── auth/               # 인증 관련
│   │   │   └── LoginForm.tsx
│   │   ├── reports/            # 주간보고서
│   │   │   ├── ReportCard.tsx
│   │   │   ├── ReportList.tsx
│   │   │   ├── CreateReportModal.tsx
│   │   │   └── ReportDetailTabs.tsx
│   │   ├── tasks/              # 업무
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── TaskFilters.tsx
│   │   ├── attendances/        # 출결
│   │   │   ├── AttendanceCard.tsx
│   │   │   ├── AttendanceList.tsx
│   │   │   ├── AttendanceForm.tsx
│   │   │   └── AttendanceSummary.tsx
│   │   └── admin/              # 관리자
│   │       ├── UsersTable.tsx
│   │       ├── TeamsTable.tsx
│   │       ├── ChainsTable.tsx
│   │       └── AttendanceTypesTable.tsx
│   │
│   ├── lib/                    # 유틸리티 및 설정
│   │   ├── api/                # API 클라이언트
│   │   │   ├── client.ts       # Axios 인스턴스
│   │   │   ├── auth.ts         # 인증 API
│   │   │   ├── reports.ts      # 주간보고서 API
│   │   │   ├── tasks.ts        # 업무 API
│   │   │   ├── attendances.ts  # 출결 API
│   │   │   ├── users.ts        # 사용자 API
│   │   │   ├── teams.ts        # 팀 API
│   │   │   ├── chains.ts       # 모듈 API
│   │   │   └── attendance-types.ts
│   │   ├── hooks/              # Custom Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useReports.ts
│   │   │   ├── useTasks.ts
│   │   │   └── useAttendances.ts
│   │   ├── store/              # Zustand 스토어
│   │   │   ├── authStore.ts
│   │   │   └── uiStore.ts
│   │   ├── utils/              # 유틸리티 함수
│   │   │   ├── format.ts       # 포맷팅 함수
│   │   │   ├── validation.ts   # 유효성 검사
│   │   │   └── date.ts         # 날짜 관련
│   │   └── constants.ts        # 상수
│   │
│   ├── types/                  # TypeScript 타입 정의
│   │   ├── api.ts              # API 응답 타입
│   │   ├── models.ts           # 엔터티 타입
│   │   └── index.ts
│   │
│   └── styles/
│       └── globals.css         # Tailwind 및 글로벌 스타일
│
├── public/                     # 정적 파일
│   ├── images/
│   └── icons/
│
├── .env.local                  # 환경 변수
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 개발 단계별 계획

### Phase 1: 프로젝트 초기 설정 (1일)

#### 1.1 프로젝트 생성 및 의존성 설치
```bash
cd apps/frontend
npx create-next-app@latest . --typescript --tailwind --app
pnpm add zustand axios react-hook-form zod date-fns
pnpm add -D @types/node
```

#### 1.2 shadcn/ui 설정
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input select textarea card dialog table
```

#### 1.3 환경 변수 설정
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

#### 1.4 기본 구조 생성
- [ ] Axios 클라이언트 설정 (인터셉터, 토큰 관리)
- [ ] Auth 스토어 생성 (Zustand)
- [ ] 타입 정의 (models.ts, api.ts)
- [ ] 유틸리티 함수 작성

---

### Phase 2: 인증 기능 (1일)

#### 2.1 로그인 페이지
- [ ] `app/(auth)/login/page.tsx` 생성
- [ ] `components/auth/LoginForm.tsx` 구현
- [ ] 로그인 API 연동
- [ ] JWT 토큰 저장 (localStorage)
- [ ] 로그인 성공 시 메인 페이지로 리다이렉트

#### 2.2 인증 체크 미들웨어
- [ ] `middleware.ts` 생성
- [ ] 토큰 검증 로직
- [ ] 보호된 라우트 설정
- [ ] 권한 체크 (ADMIN vs USER)

#### 2.3 Auth Hook
```typescript
// lib/hooks/useAuth.ts
export const useAuth = () => {
  const { user, login, logout } = useAuthStore();
  // 로그인, 로그아웃, 사용자 정보 조회
};
```

---

### Phase 3: 레이아웃 및 공통 컴포넌트 (1일)

#### 3.1 헤더 컴포넌트
- [ ] `components/layout/Header.tsx`
- [ ] 로고, 팀명, 사용자명 표시
- [ ] 드롭다운 메뉴 (관리자 메뉴, 로그아웃)

#### 3.2 메인 레이아웃
- [ ] `app/(main)/layout.tsx`
- [ ] Header 포함
- [ ] 로그인 체크

#### 3.3 UI 컴포넌트 커스터마이징
- [ ] Button 스타일 조정
- [ ] Card 컴포넌트 커스터마이징
- [ ] Modal(Dialog) 기본 레이아웃
- [ ] Table 스타일링

---

### Phase 4: 주간보고서 목록 (메인 페이지) (2일)

#### 4.1 API 연동
```typescript
// lib/api/reports.ts
export const reportsApi = {
  getList: (params) => axios.get('/weekly-reports', { params }),
  getOne: (id) => axios.get(`/weekly-reports/${id}`),
  create: (data) => axios.post('/weekly-reports', data),
  update: (id, data) => axios.patch(`/weekly-reports/${id}`, data),
  delete: (id) => axios.delete(`/weekly-reports/${id}`),
  exportPptx: (id) => axios.get(`/weekly-reports/${id}/export/pptx`, {
    responseType: 'blob',
  }),
};
```

#### 4.2 컴포넌트 구현
- [ ] `app/(main)/page.tsx` - 메인 페이지
- [ ] `components/reports/ReportList.tsx` - 목록 컨테이너
- [ ] `components/reports/ReportCard.tsx` - 개별 카드
  - 연도/주차 표시
  - 기간 표시
  - 상태 배지 (작성중/완료)
  - 요약 정보 (업무/휴가/출장 건수)
  - PPT 내보내기 버튼
- [ ] `components/reports/CreateReportModal.tsx` - 신규 생성 모달
  - 연도 선택
  - 주차 선택 (날짜 자동 계산)
  - 유효성 검사

#### 4.3 기능 구현
- [ ] 목록 조회 (무한 스크롤 or 페이지네이션)
- [ ] 신규 보고서 생성
- [ ] 상세 페이지로 이동
- [ ] PPT 다운로드

---

### Phase 5: 주간보고서 상세 - 업무 탭 (3일)

#### 5.1 페이지 구조
- [ ] `app/(main)/reports/[id]/page.tsx`
- [ ] 탭 컴포넌트 (업무 실적/계획 ↔ 인원현황)
- [ ] 헤더 (← 목록, 제목, PPT 내보내기)

#### 5.2 업무 목록
- [ ] `components/tasks/TaskList.tsx`
- [ ] `components/tasks/TaskCard.tsx`
  - 모듈 배지
  - 업무명
  - 담당자 표시
  - 일정 표시
  - 진척률 표시 (프로그레스 바)
  - 수정/삭제 버튼

#### 5.3 업무 폼
- [ ] `components/tasks/TaskForm.tsx` (Modal)
  - 모듈 선택 (Select)
  - 업무명 (Input)
  - 목적 (Textarea)
  - 일정 (DateRangePicker)
  - 담당자 (MultiSelect)
  - 총본수/완료누계 (Number Input)
  - 진척률 자동 계산 표시
  - 금주 수행실적 (Textarea - 마크다운)
  - 차주 수행계획 (Textarea - 마크다운)
- [ ] React Hook Form 연동
- [ ] Zod 스키마 검증

#### 5.4 필터 기능
- [ ] `components/tasks/TaskFilters.tsx`
- [ ] 모듈 필터
- [ ] 담당자 필터

#### 5.5 API 연동
- [ ] 업무 목록 조회
- [ ] 업무 생성/수정/삭제
- [ ] 담당자 목록 조회 (팀원)

---

### Phase 6: 주간보고서 상세 - 인원현황 탭 (2일)

#### 6.1 인원현황 요약
- [ ] `components/attendances/AttendanceSummary.tsx`
- [ ] 총 인원 / 현재 인원 표시
- [ ] 장기 출결자 계산

#### 6.2 출결 목록
- [ ] `components/attendances/AttendanceList.tsx`
- [ ] `components/attendances/AttendanceCard.tsx`
- [ ] 출장/교육 섹션
- [ ] 휴가 섹션
- [ ] 각 섹션별 추가 버튼

#### 6.3 출결 폼
- [ ] `components/attendances/AttendanceForm.tsx` (Modal)
  - 대상자 선택
  - 유형 선택 (출결 유형 API 연동)
  - 기간 선택
  - 내용 (Input)
  - 장소 (Input)
  - 비고 (Textarea)
- [ ] React Hook Form 연동

#### 6.4 API 연동
- [ ] 출결 목록 조회
- [ ] 출결 생성/수정/삭제
- [ ] 출결 유형 목록 조회

---

### Phase 7: 관리자 페이지 (2일)

#### 7.1 레이아웃
- [ ] `app/(main)/admin/layout.tsx`
- [ ] 사이드바 네비게이션
- [ ] 권한 체크 (ADMIN만)

#### 7.2 사용자 관리
- [ ] `app/(main)/admin/users/page.tsx`
- [ ] `components/admin/UsersTable.tsx`
- [ ] 사용자 추가/수정 모달
- [ ] CRUD 기능

#### 7.3 팀 관리
- [ ] `app/(main)/admin/teams/page.tsx`
- [ ] `components/admin/TeamsTable.tsx`
- [ ] 팀 추가/수정 모달

#### 7.4 모듈 관리
- [ ] `app/(main)/admin/chains/page.tsx`
- [ ] `components/admin/ChainsTable.tsx`
- [ ] 모듈 추가/수정 모달
- [ ] 활성화/비활성화

#### 7.5 출결유형 관리
- [ ] `app/(main)/admin/attendance-types/page.tsx`
- [ ] `components/admin/AttendanceTypesTable.tsx`
- [ ] 유형 추가/수정 모달

---

## 상태 관리 전략

### Zustand 스토어

#### 1. Auth Store
```typescript
// lib/store/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}
```

#### 2. UI Store (선택사항)
```typescript
// lib/store/uiStore.ts
interface UiState {
  isLoading: boolean;
  toastMessage: string | null;
  showToast: (message: string) => void;
}
```

### Server State 관리
- React Query는 사용하지 않음 (프로젝트 규모 고려)
- Custom hooks로 데이터 페칭 및 캐싱 관리

---

## API 통신 구조

### Axios 인터셉터 설정

```typescript
// lib/api/client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Request 인터셉터 (토큰 추가)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그아웃
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 스타일링 가이드

### Tailwind CSS 커스텀 설정

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        // 추가 컬러
      },
    },
  },
};
```

### 컴포넌트 스타일 컨벤션
- Tailwind 유틸리티 우선 사용
- 재사용 가능한 스타일은 globals.css에 정의
- shadcn/ui 컴포넌트 스타일 일관성 유지

---

## 폼 관리

### React Hook Form + Zod 예시

```typescript
// components/tasks/TaskForm.tsx
const taskSchema = z.object({
  chainId: z.string().uuid(),
  title: z.string().min(1, '업무명을 입력하세요'),
  assigneeIds: z.array(z.string().uuid()).min(1, '담당자를 선택하세요'),
  // ...
});

type TaskFormData = z.infer<typeof taskSchema>;

const TaskForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const onSubmit = async (data: TaskFormData) => {
    // API 호출
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
};
```

---

## 라우팅 구조

```
/login                           # 로그인
/                                # 주간보고서 목록 (메인)
/reports/[id]                    # 주간보고서 상세
/admin/users                     # 사용자 관리
/admin/teams                     # 팀 관리
/admin/chains                    # 모듈 관리
/admin/attendance-types          # 출결유형 관리
```

### 보호된 라우트 (middleware.ts)
```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');

  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Admin 권한 체크
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 토큰에서 role 확인 로직
  }
}
```

---

## 유틸리티 함수

### 날짜 포맷팅
```typescript
// lib/utils/date.ts
export const formatDate = (date: Date | string) => {
  return format(new Date(date), 'yyyy-MM-dd');
};

export const formatDateRange = (start: Date, end: Date) => {
  return `${format(start, 'MM/dd')} ~ ${format(end, 'MM/dd')}`;
};
```

### 주차 계산
```typescript
export const getWeekNumber = (date: Date) => {
  return getWeek(date, { weekStartsOn: 1 });
};

export const getWeekRange = (year: number, week: number) => {
  // 주차로부터 시작일/종료일 계산
};
```

---

## 에러 처리

### 에러 바운더리
```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>문제가 발생했습니다</h2>
      <button onClick={reset}>다시 시도</button>
    </div>
  );
}
```

### Toast 알림
- shadcn/ui의 Toast 컴포넌트 사용
- 성공/에러 메시지 표시

---

## 테스트 전략 (선택사항)

- 단위 테스트: Jest + React Testing Library
- E2E 테스트: Playwright (시간 여유 있을 때)

---

## 성능 최적화

1. **이미지 최적화**
   - Next.js Image 컴포넌트 사용

2. **코드 스플리팅**
   - Dynamic import로 모달, 큰 컴포넌트 lazy loading

3. **API 캐싱**
   - SWR 또는 React Query 고려 (필요시)
   - 현재는 Custom hooks로 간단히 구현

4. **번들 크기 최적화**
   - Tree shaking
   - date-fns 필요한 함수만 import

---

## 개발 우선순위 요약

### 높음 (필수)
1. ✅ 프로젝트 초기 설정
2. ✅ 인증 (로그인/로그아웃)
3. ✅ 주간보고서 목록
4. ✅ 주간보고서 상세 - 업무 탭
5. ✅ 주간보고서 상세 - 인원현황 탭
6. ✅ PPT 내보내기

### 중간
7. ✅ 관리자 - 사용자 관리
8. ✅ 관리자 - 팀 관리
9. ✅ 관리자 - 모듈 관리
10. ✅ 관리자 - 출결유형 관리

### 낮음 (개선)
11. ⬜ UI/UX 개선
12. ⬜ 반응형 최적화
13. ⬜ 다크모드 (선택)
14. ⬜ 접근성 개선

---

## 주의사항

1. **마크다운 에디터**
   - 기본 Textarea 사용
   - 향후 필요시 마크다운 에디터 라이브러리 추가

2. **파일 다운로드 (PPT)**
   - Blob 응답 처리
   - 파일명 한글 인코딩 처리

3. **날짜 선택기**
   - react-datepicker 또는 shadcn/ui calendar 사용

4. **다중 선택 (담당자)**
   - shadcn/ui multi-select 또는 커스텀 구현

5. **토큰 관리**
   - localStorage 사용 (httpOnly 쿠키 추후 고려)
   - 토큰 만료 시 자동 로그아웃

---

## 다음 단계

1. Phase 1 시작: 프로젝트 초기 설정
2. 백엔드 API 서버 실행 확인
3. API 문서(Swagger) 참고하여 개발

---

## 변경 이력

| 버전 | 날짜 | 내용 |
|------|------|------|
| 1.0 | 2026-01-08 | 최초 작성 |
