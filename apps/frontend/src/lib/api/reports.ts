import { apiClient } from './client';
import type {
  WeeklyReport,
  CreateWeeklyReportRequest,
  UpdateWeeklyReportRequest,
} from '@/types';

export const reportsApi = {
  // 주간보고서 목록 조회
  getList: async (params?: {
    teamId?: string;
    year?: number;
    page?: number;
    limit?: number;
  }): Promise<WeeklyReport[]> => {
    const response = await apiClient.get('/weekly-reports', { params });
    return response.data;
  },

  // 주간보고서 상세 조회
  getOne: async (id: string): Promise<WeeklyReport> => {
    const response = await apiClient.get(`/weekly-reports/${id}`);
    return response.data;
  },

  // 주간보고서 생성
  create: async (data: CreateWeeklyReportRequest): Promise<WeeklyReport> => {
    const response = await apiClient.post('/weekly-reports', data);
    return response.data;
  },

  // 주간보고서 수정
  update: async (
    id: string,
    data: UpdateWeeklyReportRequest
  ): Promise<WeeklyReport> => {
    const response = await apiClient.patch(`/weekly-reports/${id}`, data);
    return response.data;
  },

  // 주간보고서 삭제
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/weekly-reports/${id}`);
  },

  // PPT 내보내기
  exportPptx: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/weekly-reports/${id}/export/pptx`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
