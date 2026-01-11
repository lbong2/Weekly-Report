import { apiClient } from './client';
import type {
  AttendanceType,
  CreateAttendanceTypeRequest,
  UpdateAttendanceTypeRequest,
} from '@/types';

export const attendanceTypesApi = {
  // 출결 유형 목록 조회
  getList: async (params?: {
    category?: string;
    isActive?: boolean;
  }): Promise<AttendanceType[]> => {
    const response = await apiClient.get('/attendance-types', { params });
    return response.data;
  },

  // 출결 유형 상세 조회
  getOne: async (id: string): Promise<AttendanceType> => {
    const response = await apiClient.get(`/attendance-types/${id}`);
    return response.data;
  },

  // 출결 유형 생성
  create: async (data: CreateAttendanceTypeRequest): Promise<AttendanceType> => {
    const response = await apiClient.post('/attendance-types', data);
    return response.data;
  },

  // 출결 유형 수정
  update: async (
    id: string,
    data: UpdateAttendanceTypeRequest,
  ): Promise<AttendanceType> => {
    const response = await apiClient.patch(`/attendance-types/${id}`, data);
    return response.data;
  },

  // 출결 유형 삭제
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/attendance-types/${id}`);
  },
};