import { apiClient } from './client';
import type { ReportFile } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const filesApi = {
  // 파일 목록 조회 (주간보고서별)
  getList: async (weeklyReportId: string): Promise<ReportFile[]> => {
    const response = await apiClient.get('/files', {
      params: { weeklyReportId },
    });
    return response.data;
  },

  // Task별 파일 목록 조회
  getListByTask: async (taskId: string): Promise<ReportFile[]> => {
    const response = await apiClient.get('/files', {
      params: { taskId },
    });
    return response.data;
  },

  // 파일 업로드
  upload: async (
    weeklyReportId: string,
    file: File,
    taskId?: string,
    description?: string
  ): Promise<ReportFile> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('weeklyReportId', weeklyReportId);
    if (taskId) {
      formData.append('taskId', taskId);
    }
    if (description) {
      formData.append('description', description);
    }

    const response = await apiClient.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // 파일 정보 조회
  getOne: async (id: string): Promise<ReportFile> => {
    const response = await apiClient.get(`/files/${id}`);
    return response.data;
  },

  // 파일 다운로드 URL (공개 접근)
  getDownloadUrl: (id: string): string => {
    return `${API_BASE_URL}/files/${id}/download`;
  },

  // 파일 정보 수정
  update: async (id: string, data: { description?: string }): Promise<ReportFile> => {
    const response = await apiClient.patch(`/files/${id}`, data);
    return response.data;
  },

  // 파일 삭제
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/files/${id}`);
  },
};
