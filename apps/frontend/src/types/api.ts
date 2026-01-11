// API 요청/응답 타입 정의

import {
  User,
  Team,
  Chain,
  WeeklyReport,
  Task,
  Attendance,
  AttendanceType,
  Role,
  Position,
  ReportStatus,
  AttendanceCategory,
  IssueStatus,
} from './models';

// 로그인
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

// 사용자
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  teamId: string;
  role?: Role;
  position?: Position;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  name?: string;
  teamId?: string;
  role?: Role;
  position?: Position;
}

// 팀
export interface CreateTeamRequest {
  name: string;
  location?: string;
  totalMembers?: number;
}

export interface UpdateTeamRequest {
  name?: string;
  location?: string;
  totalMembers?: number;
}

// 모듈/체인
export interface CreateChainRequest {
  code: string;
  name: string;
  color: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateChainRequest {
  code?: string;
  name?: string;
  color?: string;
  displayOrder?: number;
  isActive?: boolean;
}

// 주간보고서
export interface CreateWeeklyReportRequest {
  teamId: string;
  year: number;
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  status?: ReportStatus;
}

export interface UpdateWeeklyReportRequest {
  weekStart?: string;
  weekEnd?: string;
  status?: ReportStatus;
}

// 업무
export interface CreateTaskRequest {
  weeklyReportId: string;
  chainId: string;
  title: string;
  purpose?: string;
  startDate?: string;
  endDate?: string;
  totalCount?: number;
  completedCount?: number;
  progress?: number;
  showThisWeekAchievement?: boolean;
  nextTotalCount?: number;
  nextCompletedCount?: number;
  nextProgress?: number;
  showNextWeekAchievement?: boolean;
  thisWeekContent?: string;
  nextWeekContent?: string;
  displayOrder?: number;
  assigneeIds?: string[];
  issueId?: string;
}

export interface UpdateTaskRequest {
  chainId?: string;
  title?: string;
  purpose?: string;
  startDate?: string;
  endDate?: string;
  totalCount?: number;
  completedCount?: number;
  progress?: number;
  showThisWeekAchievement?: boolean;
  nextTotalCount?: number;
  nextCompletedCount?: number;
  nextProgress?: number;
  showNextWeekAchievement?: boolean;
  thisWeekContent?: string;
  nextWeekContent?: string;
  displayOrder?: number;
  assigneeIds?: string[];
  issueId?: string;
}

// 출결 유형
export interface CreateAttendanceTypeRequest {
  code: string;
  name: string;
  category: AttendanceCategory;
  isLongTerm?: boolean;
  isActive?: boolean;
}

export interface UpdateAttendanceTypeRequest {
  code?: string;
  name?: string;
  category?: AttendanceCategory;
  isLongTerm?: boolean;
  isActive?: boolean;
}

// 출결
export interface CreateAttendanceRequest {
  userId: string;
  typeId: string;
  content?: string;
  startDate: string;
  endDate: string;
  location?: string;
  remarks?: string;
}

export interface UpdateAttendanceRequest {
  userId?: string;
  typeId?: string;
  content?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  remarks?: string;
}

// 페이지네이션
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// API 에러
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

// 이슈 (장기 업무)
export interface CreateIssueRequest {
  chainId: string;
  title: string;
  status: IssueStatus;
  purpose?: string;
  startDate?: string;
  endDate?: string;
  totalCount?: number;
  completedCount?: number;
  progress?: number;
  assigneeIds?: string[];
}

export interface UpdateIssueRequest {
  chainId?: string;
  title?: string;
  status?: IssueStatus;
  purpose?: string;
  startDate?: string;
  endDate?: string;
  totalCount?: number;
  completedCount?: number;
  progress?: number;
  assigneeIds?: string[];
}
