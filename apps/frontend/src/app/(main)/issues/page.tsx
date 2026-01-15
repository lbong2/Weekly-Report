'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import IssueList from '@/components/issues/IssueList';
import IssueFormModal from '@/components/issues/IssueFormModal';
import { Issue, Chain, IssueStatus } from '@/types/models';
import { CreateIssueRequest, UpdateIssueRequest } from '@/types/api';
import { issuesApi } from '@/lib/api/issues';
import { apiClient } from '@/lib/api/client';

type ViewMode = 'personal' | 'team';

export default function IssuesPage() {
    const { user, isAdmin } = useAuth();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [chains, setChains] = useState<Chain[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
    const [statusFilter, setStatusFilter] = useState<IssueStatus | 'ALL'>('IN_PROGRESS');
    // 보기 모드: 관리자는 팀 실적, 일반 사용자는 개인 실적이 기본
    const [viewMode, setViewMode] = useState<ViewMode>(isAdmin ? 'team' : 'personal');

    const fetchIssues = useCallback(async () => {
        if (!user?.teamId) return;
        try {
            const data = await issuesApi.getList({ teamId: user.teamId });
            setIssues(data);
        } catch (err) {
            console.error('Failed to fetch issues', err);
        } finally {
            setLoading(false);
        }
    }, [user?.teamId]);

    const fetchChains = async () => {
        try {
            // chains 엔드포인트 호출 (인증 헤더 포함)
            const { data } = await apiClient.get<Chain[]>('/chains');
            setChains(data);
        } catch (err) {
            console.error('Failed to fetch chains', err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchIssues();
            fetchChains();
        }
    }, [user, fetchIssues]);

    const handleCreate = () => {
        setEditingIssue(null);
        setIsModalOpen(true);
    };

    const handleEdit = (issue: Issue) => {
        setEditingIssue(issue);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('이슈를 삭제하시겠습니까?')) return;
        try {
            await issuesApi.delete(id);
            fetchIssues();
        } catch (err) {
            console.error(err);
            alert('삭제 실패');
        }
    };

    const handleSubmit = async (data: CreateIssueRequest | UpdateIssueRequest) => {
        try {
            if (editingIssue) {
                await issuesApi.update(editingIssue.id, data);
            } else {
                await issuesApi.create(data as CreateIssueRequest);
            }
            setIsModalOpen(false);
            fetchIssues();
        } catch (err: any) {
            throw err;
        }
    };

    // 상태별 + 보기 모드 필터링
    const filteredIssues = useMemo(() => {
        let result = issues;

        // 상태 필터
        if (statusFilter !== 'ALL') {
            result = result.filter(issue => issue.status === statusFilter);
        }

        // 보기 모드 필터 (개인 실적일 경우 본인이 담당자인 이슈만)
        if (viewMode === 'personal' && user) {
            result = result.filter(issue =>
                issue.assignees?.some(a => a.userId === user.id)
            );
        }

        return result;
    }, [issues, statusFilter, viewMode, user]);

    // 상태별 옵션
    const statusOptions = [
        { value: 'ALL', label: '전체' },
        { value: 'BACKLOG', label: '대기' },
        { value: 'IN_PROGRESS', label: '진행중' },
        { value: 'HOLD', label: '보류' },
        { value: 'DONE', label: '완료' },
    ];

    return (
        <div className="container mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">장기 업무(이슈) 관리</h1>
                <p className="mt-1 text-sm text-gray-500">
                    주간보고서 생성 시 &apos;진행중&apos;인 이슈가 자동으로 포함됩니다.
                </p>
            </div>

            {/* 필터 영역 */}
            <div className="mb-4 flex items-center gap-4">
                <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as ViewMode)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="personal">개인 실적</option>
                    <option value="team">팀 실적</option>
                </select>
                <div className="flex items-center gap-2">
                    <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                        상태:
                    </label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as IssueStatus | 'ALL')}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <span className="text-sm text-gray-500">
                    {filteredIssues.length}개의 이슈
                </span>
            </div>

            {loading ? (
                <div className="text-center py-20">로딩 중...</div>
            ) : (
                <IssueList
                    issues={filteredIssues}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {isModalOpen && (
                <IssueFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                    initialData={editingIssue}
                    chains={chains}
                />
            )}
        </div>
    );
}
