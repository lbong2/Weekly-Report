import { apiClient } from './client';
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types';

export const usersApi = {
  // 사용자 목록 조회
  getList: async (): Promise<User[]> => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  // 사용자 상세 조회
  getOne: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // 사용자 생성
  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  // 사용자 수정
  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  },

  // 사용자 삭제
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
