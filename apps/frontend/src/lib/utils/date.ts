import { format, getWeek, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 */
export const formatDate = (date: Date | string): string => {
  return format(new Date(date), 'yyyy-MM-dd');
};

/**
 * 날짜를 MM/DD 형식으로 포맷
 */
export const formatDateShort = (date: Date | string): string => {
  return format(new Date(date), 'MM/dd');
};

/**
 * 날짜 범위를 포맷 (예: 01/05 ~ 01/09)
 */
export const formatDateRange = (start: Date | string, end: Date | string): string => {
  return `${formatDateShort(start)} ~ ${formatDateShort(end)}`;
};

/**
 * 날짜로부터 주차 계산 (ISO 8601)
 */
export const getWeekNumber = (date: Date): number => {
  return getWeek(date, { weekStartsOn: 1, firstWeekContainsDate: 4 });
};

/**
 * 연도와 주차로부터 주간 범위 계산
 */
export const getWeekRange = (
  year: number,
  week: number
): { start: Date; end: Date } => {
  // ISO 8601 기준: 해당 연도 첫 번째 목요일이 포함된 주가 1주차
  const jan4 = new Date(year, 0, 4);
  const firstWeekStart = startOfWeek(jan4, { weekStartsOn: 1 });

  const targetWeekStart = addDays(firstWeekStart, (week - 1) * 7);
  const targetWeekEnd = endOfWeek(targetWeekStart, { weekStartsOn: 1 });

  return {
    start: targetWeekStart,
    end: targetWeekEnd,
  };
};

/**
 * 현재 연도 가져오기
 */
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

/**
 * 현재 주차 가져오기
 */
export const getCurrentWeek = (): number => {
  return getWeekNumber(new Date());
};

/**
 * 날짜를 한글 형식으로 포맷 (예: 2026년 1월 8일)
 */
export const formatDateKorean = (date: Date | string): string => {
  return format(new Date(date), 'yyyy년 M월 d일', { locale: ko });
};
