import { apiClient } from './client';
import type { Chain, CreateChainRequest, UpdateChainRequest } from '@/types';

export const chainsApi = {
  // 모듈 목록 조회
  getList: async (params?: { isActive?: boolean }): Promise<Chain[]> => {
    const response = await apiClient.get('/chains', { params });
    return response.data;
  },

  // 모듈 상세 조회
  getOne: async (id: string): Promise<Chain> => {
    const response = await apiClient.get(`/chains/${id}`);
    return response.data;
  },

  // 모듈 생성
  create: async (data: CreateChainRequest): Promise<Chain> => {
    const response = await apiClient.post('/chains', data);
    return response.data;
  },

  // 모듈 수정
  update: async (id: string, data: UpdateChainRequest): Promise<Chain> => {
    const response = await apiClient.patch(`/chains/${id}`, data);
    return response.data;
  },

  // 모듈 삭제
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/chains/${id}`);
  },
};