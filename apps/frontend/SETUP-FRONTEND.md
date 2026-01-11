# 프론트엔드 설정 가이드

## Phase 1 완료 ✅

다음 파일들이 생성되었습니다:
- ✅ 타입 정의 (types/)
- ✅ API 클라이언트 (lib/api/)
- ✅ 유틸리티 함수 (lib/utils/)
- ✅ Auth 스토어 (lib/store/)
- ✅ 상수 정의 (lib/constants.ts)

---

## 추가 의존성 설치 필요

WSL 터미널에서 다음 명령어를 실행하세요:

```bash
cd /home/longbee/weekly-report/apps/frontend
pnpm add zod @hookform/resolvers
```

---

## 환경 변수 확인

`.env.local` 파일이 올바르게 설정되어 있는지 확인하세요:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## 다음 단계: Phase 2 - 인증 기능

다음 파일들을 생성할 예정:

1. **로그인 페이지**
   - `app/(auth)/login/page.tsx`
   - `components/auth/LoginForm.tsx`

2. **미들웨어**
   - `middleware.ts` (라우트 보호)

3. **Custom Hook**
   - `lib/hooks/useAuth.ts`

---

## 개발 서버 실행

```bash
cd apps/frontend
pnpm dev
```

프론트엔드는 `http://localhost:3001`에서 실행됩니다.

---

## 현재 진행 상황

- [x] Phase 1: 프로젝트 초기 설정
  - [x] 타입 정의
  - [x] API 클라이언트
  - [x] 유틸리티 함수
  - [x] Auth 스토어
- [ ] Phase 2: 인증 기능
- [ ] Phase 3: 레이아웃 및 공통 컴포넌트
- [ ] Phase 4: 주간보고서 목록
- [ ] Phase 5: 주간보고서 상세 - 업무 탭
- [ ] Phase 6: 주간보고서 상세 - 인원현황 탭
- [ ] Phase 7: 관리자 페이지
