import { apiClient } from './client';
import type { Team, CreateTeamRequest, UpdateTeamRequest } from '@/types';

export const teamsApi = {
  // 팀 목록 조회
  getList: async (): Promise<Team[]> => {
    const response = await apiClient.get('/teams');
    return response.data;
  },

  // 팀 상세 조회
  getOne: async (id: string): Promise<Team> => {
    const response = await apiClient.get(`/teams/${id}`);
    return response.data;
  },

  // 팀 생성
  create: async (data: CreateTeamRequest): Promise<Team> => {
    const response = await apiClient.post('/teams', data);
    return response.data;
  },

  // 팀 수정
  update: async (id: string, data: UpdateTeamRequest): Promise<Team> => {
    const response = await apiClient.patch(`/teams/${id}`, data);
    return response.data;
  },

  // 팀 삭제
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/teams/${id}`);
  },
};
