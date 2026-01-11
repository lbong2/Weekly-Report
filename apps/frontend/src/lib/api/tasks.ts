import { apiClient } from './client';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types';

export const tasksApi = {
  // 업무 목록 조회
  getList: async (params: {
    weeklyReportId: string;
    chainId?: string;
    assigneeId?: string;
  }): Promise<Task[]> => {
    const response = await apiClient.get('/tasks', { params });
    return response.data;
  },

  // 업무 상세 조회
  getOne: async (id: string): Promise<Task> => {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  },

  // 업무 생성
  create: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await apiClient.post('/tasks', data);
    return response.data;
  },

  // 업무 수정
  update: async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await apiClient.patch(`/tasks/${id}`, data);
    return response.data;
  },

  // 업무 삭제
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
