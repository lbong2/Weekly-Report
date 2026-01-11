/**
 * 진척률 포맷팅
 */
export const formatProgress = (progress: number): string => {
  return `${progress}%`;
};

/**
 * 총본수/완료누계 포맷팅
 */
export const formatCount = (completed: number, total: number): string => {
  return `${completed}/${total}`;
};

/**
 * 파일 다운로드
 */
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * 상태 배지 텍스트
 */
export const getStatusText = (status: 'DRAFT' | 'COMPLETED'): string => {
  return status === 'DRAFT' ? '작성중' : '완료';
};

/**
 * 상태 배지 색상 클래스
 */
export const getStatusColorClass = (status: 'DRAFT' | 'COMPLETED'): string => {
  return status === 'DRAFT'
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-green-100 text-green-800';
};

/**
 * 역할 텍스트
 */
export const getRoleText = (role: 'USER' | 'ADMIN'): string => {
  return role === 'ADMIN' ? '관리자' : '사용자';
};

/**
 * 출결 카테고리 텍스트
 */
export const getAttendanceCategoryText = (
  category: 'LEAVE' | 'BUSINESS_TRIP'
): string => {
  return category === 'LEAVE' ? '휴가' : '출장';
};

/**
 * 숫자를 천단위 콤마로 포맷
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('ko-KR');
};

/**
 * 빈 값 체크
 */
export const isEmpty = (value: any): boolean => {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  );
};
