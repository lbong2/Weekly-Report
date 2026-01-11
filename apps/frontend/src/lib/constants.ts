// 상수 정의

export const APP_NAME = '주간보고 시스템';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REPORTS: '/reports',
  ADMIN: {
    USERS: '/admin/users',
    TEAMS: '/admin/teams',
    CHAINS: '/admin/chains',
    ATTENDANCE_TYPES: '/admin/attendance-types',
  },
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export const REPORT_STATUS = {
  DRAFT: 'DRAFT',
  COMPLETED: 'COMPLETED',
} as const;

export const ATTENDANCE_CATEGORY = {
  LEAVE: 'LEAVE',
  BUSINESS_TRIP: 'BUSINESS_TRIP',
} as const;
