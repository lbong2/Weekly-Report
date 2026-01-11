import { apiClient } from './client';
import { Issue, IssueStatus } from '@/types/models';
import { CreateIssueRequest, UpdateIssueRequest, PaginatedResponse } from '@/types/api';

export const issuesApi = {
    // 목록 조회
    getList: async (params?: { chainId?: string; status?: IssueStatus; teamId?: string }) => {
        const { data } = await apiClient.get<Issue[]>('/issues', { params });
        return data;
    },

    // 상세 조회
    getOne: async (id: string) => {
        const { data } = await apiClient.get<Issue>(`/issues/${id}`);
        return data;
    },

    // 생성
    create: async (data: CreateIssueRequest) => {
        const { data: issue } = await apiClient.post<Issue>('/issues', data);
        return issue;
    },

    // 수정
    update: async (id: string, data: UpdateIssueRequest) => {
        const { data: issue } = await apiClient.patch<Issue>(`/issues/${id}`, data);
        return issue;
    },

    // 삭제
    delete: async (id: string) => {
        await apiClient.delete(`/issues/${id}`);
    },
};
