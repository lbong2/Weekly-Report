import { apiClient } from './client';
import type {
  Attendance,
  CreateAttendanceRequest,
  UpdateAttendanceRequest,
} from '@/types';

export const attendancesApi = {
  // 출결 목록 조회
  getList: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<Attendance[]> => {
    const response = await apiClient.get('/attendances', { params });
    return response.data;
  },

  // 출결 상세 조회
  getOne: async (id: string): Promise<Attendance> => {
    const response = await apiClient.get(`/attendances/${id}`);
    return response.data;
  },

  // 출결 생성
  create: async (data: CreateAttendanceRequest): Promise<Attendance> => {
    const response = await apiClient.post('/attendances', data);
    return response.data;
  },

  // 출결 수정
  update: async (
    id: string,
    data: UpdateAttendanceRequest
  ): Promise<Attendance> => {
    const response = await apiClient.patch(`/attendances/${id}`, data);
    return response.data;
  },

  // 출결 삭제
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/attendances/${id}`);
  },
};
