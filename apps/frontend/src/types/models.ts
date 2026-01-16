// 엔터티 타입 정의

export type IssueStatus = 'BACKLOG' | 'IN_PROGRESS' | 'DONE' | 'HOLD';

export type Role = 'USER' | 'ADMIN';
export type Position = 'STAFF' | 'MANAGER' | 'TEAM_LEAD';
export type ReportStatus = 'DRAFT' | 'COMPLETED';
export type AttendanceCategory = 'LEAVE' | 'BUSINESS_TRIP';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  position: Position;
  teamId: string;
  displayOrder: number;
  team: Team;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  location?: string;
  totalMembers: number;
  createdAt: string;
  updatedAt: string;
}

export interface Chain {
  id: string;
  code: string;
  name: string;
  color: string;
  displayOrder: number;
  isActive: boolean;
  assignees?: ChainAssignee[];
  createdAt: string;
  updatedAt: string;
}

export interface ChainAssignee {
  id: string;
  chainId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    position: Position;
    displayOrder: number;
  };
}

export interface WeeklyReport {
  id: string;
  teamId: string;
  team: Team;
  year: number;
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  status: ReportStatus;
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  weeklyReportId: string;
  chainId: string;
  chain: Chain;
  title: string;
  purpose?: string;
  startDate?: string;
  endDate?: string;
  totalCount: number;
  completedCount: number;
  progress: number;
  thisWeekContent?: string;
  showThisWeekAchievement: boolean;
  nextWeekContent?: string;
  nextTotalCount: number;
  nextCompletedCount: number;
  nextProgress: number;
  showNextWeekAchievement: boolean;
  displayOrder: number;
  issueId?: string;
  issue?: Issue;
  assignees: TaskAssignee[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignee {
  id: string;
  taskId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    displayOrder: number;
    position: Position;
  };
}

export interface AttendanceType {
  id: string;
  code: string;
  name: string;
  category: AttendanceCategory;
  isLongTerm: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  typeId: string;
  type: AttendanceType;
  content?: string;
  startDate: string;
  endDate: string;
  location?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  teamId: string;
  chainId: string;
  chain?: Chain;
  title: string;
  status: IssueStatus;
  purpose?: string;
  startDate?: string;
  endDate?: string;
  totalCount: number;
  completedCount: number;
  progress: number;
  assignees: IssueAssignee[];
  createdAt: string;
  updatedAt: string;
}

export interface IssueAssignee {
  id: string;
  issueId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    position: Position;
    role: Role;
  };
}

export interface ReportFile {
  id: string;
  weeklyReportId: string;
  taskId?: string;
  uploaderId: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  path: string;
  description?: string;
  uploader: {
    id: string;
    name: string;
  };
  task?: {
    id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}
