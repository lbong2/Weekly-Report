'use client';

import { useEffect, useState, useRef } from 'react';
import { chainsApi } from '@/lib/api/chains';
import { usersApi } from '@/lib/api/users';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Task, Chain, User, CreateTaskRequest } from '@/types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskRequest) => Promise<void>;
  weeklyReportId: string;
  editTask?: Task | null;
}

/**
 * 업무 추가/수정 모달
 */
export function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  weeklyReportId,
  editTask,
}: TaskFormModalProps) {
  const { user: currentUser } = useAuth();
  const [chains, setChains] = useState<Chain[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CreateTaskRequest>({
    weeklyReportId,
    chainId: '',
    title: '',
    purpose: '',
    startDate: '',
    endDate: '',
    totalCount: 0,
    completedCount: 0,
    progress: 0,
    thisWeekContent: '',
    nextWeekContent: '',
    nextTotalCount: 0,
    nextCompletedCount: 0,
    nextProgress: 0,
    showNextWeekAchievement: true,
    showThisWeekAchievement: true,
    assigneeIds: [],
  });

  // 모달이 열릴 때 모듈, 사용자 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadData();
    } else {
      // 모달이 닫힐 때 드롭다운도 닫기
      setIsAssigneeDropdownOpen(false);
    }
  }, [isOpen]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        assigneeDropdownRef.current &&
        !assigneeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAssigneeDropdownOpen(false);
      }
    };

    if (isAssigneeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAssigneeDropdownOpen]);

  // 수정 모드일 때 폼 데이터 채우기
  useEffect(() => {
    if (!isOpen) return; // 모달이 닫혀있으면 실행하지 않음

    if (editTask) {
      // 날짜 포맷 변환 함수
      const formatDateFromISO = (dateStr: string | null | undefined) => {
        if (!dateStr) return '';
        // ISO 형식이면 YYYY-MM-DD만 추출
        return dateStr.split('T')[0];
      };

      setFormData({
        weeklyReportId,
        chainId: editTask.chainId,
        title: editTask.title,
        purpose: editTask.purpose || '',
        startDate: formatDateFromISO(editTask.startDate),
        endDate: formatDateFromISO(editTask.endDate),
        totalCount: editTask.totalCount,
        completedCount: editTask.completedCount,
        progress: editTask.progress || 0,
        thisWeekContent: editTask.thisWeekContent || '',
        nextWeekContent: editTask.nextWeekContent || '',
        nextTotalCount: editTask.nextTotalCount || 0,
        nextCompletedCount: editTask.nextCompletedCount || 0,
        nextProgress: editTask.nextProgress || 0,
        showNextWeekAchievement: editTask.showNextWeekAchievement ?? true,
        showThisWeekAchievement: editTask.showThisWeekAchievement ?? true,
        assigneeIds: editTask.assignees.map((a) => a.userId),
      });
    } else {
      // 추가 모드일 때 초기화 (이번 달 초~말 기본값)
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // 현재 사용자가 담당하는 모듈 중 displayOrder가 가장 빠른 모듈 찾기
      let defaultChainId = '';
      if (currentUser && chains.length > 0) {
        const userAssignedChains = chains
          .filter((chain) =>
            chain.assignees?.some((assignee) => assignee.userId === currentUser.id)
          )
          .sort((a, b) => a.displayOrder - b.displayOrder);

        if (userAssignedChains.length > 0) {
          defaultChainId = userAssignedChains[0].id;
        }
      }

      // 현재 사용자를 담당자 기본값으로 설정
      const defaultAssigneeIds = currentUser ? [currentUser.id] : [];

      setFormData({
        weeklyReportId,
        chainId: defaultChainId,
        title: '',
        purpose: '',
        startDate: formatDate(firstDay),
        endDate: formatDate(lastDay),
        totalCount: 0,
        completedCount: 0,
        progress: 0,
        thisWeekContent: '',
        nextWeekContent: '',
        nextTotalCount: 0,
        nextCompletedCount: 0,
        nextProgress: 0,
        showNextWeekAchievement: true,
        showThisWeekAchievement: true,
        assigneeIds: defaultAssigneeIds,
      });
    }
  }, [isOpen, editTask, weeklyReportId, chains, currentUser]);

  const loadData = async () => {
    try {
      const [chainsData, usersData] = await Promise.all([
        chainsApi.getList({ isActive: true }), // 활성화된 모듈만
        usersApi.getList(),
      ]);
      setChains(chainsData);
      setUsers(usersData);
    } catch (err) {
      console.error('데이터 로딩 실패:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.chainId) {
      alert('모듈을 선택해주세요.');
      return;
    }
    if (!formData.title.trim()) {
      alert('업무 제목을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      alert(err.message || '업무 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssigneeToggle = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      assigneeIds: prev.assigneeIds?.includes(userId)
        ? prev.assigneeIds.filter((id) => id !== userId)
        : [...(prev.assigneeIds || []), userId],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold">
            {editTask ? '업무 수정' : '업무 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 모듈 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              모듈 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.chainId}
              onChange={(e) =>
                setFormData({ ...formData, chainId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">선택하세요</option>
              {chains.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              업무 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="업무 제목을 입력하세요"
              required
            />
          </div>

          {/* 목적 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              업무 목적
            </label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) =>
                setFormData({ ...formData, purpose: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="업무의 목적을 입력하세요 (선택사항)"
            />
          </div>

          {/* 일정 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작일
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료일
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 담당자 */}
          <div className="relative" ref={assigneeDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              담당자
            </label>
            {/* 선택된 담당자 표시 및 드롭다운 토글 */}
            <div
              onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
              className="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-md cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
            >
              <div className="flex flex-wrap gap-1 flex-1">
                {formData.assigneeIds && formData.assigneeIds.length > 0 ? (
                  formData.assigneeIds.map((userId) => {
                    const user = users.find((u) => u.id === userId);
                    return user ? (
                      <span
                        key={userId}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-sm rounded"
                      >
                        {user.name}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssigneeToggle(userId);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })
                ) : (
                  <span className="text-gray-400">담당자를 선택하세요</span>
                )}
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${isAssigneeDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {/* 드롭다운 목록 */}
            {isAssigneeDropdownOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {users.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center space-x-2 px-3 py-2 cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.assigneeIds?.includes(user.id)}
                      onChange={() => handleAssigneeToggle(user.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">
                      {user.name} ({user.email})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <hr className="border-gray-200" />

          {/* 금주 실적 / 차주 계획 가로 배치 */}
          <div className="grid grid-cols-2 gap-6">
            {/* 금주 실적 섹션 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">금주 실적</h3>
                <label className="flex items-center space-x-1 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showThisWeekAchievement ?? true}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        showThisWeekAchievement: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>진척률 텍스트 표시</span>
                </label>
              </div>

              {/* 금주 수치 입력 */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    총 개수
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalCount}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        totalCount: newValue,
                        nextTotalCount: newValue,
                      });
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    완료 개수
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.completedCount}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        completedCount: newValue,
                        nextCompletedCount: newValue,
                      });
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    진척률 (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        progress: newValue,
                        nextProgress: newValue,
                      });
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 금주 실적 내용 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  실적 내용
                </label>
                <textarea
                  value={formData.thisWeekContent}
                  onChange={(e) =>
                    setFormData({ ...formData, thisWeekContent: e.target.value })
                  }
                  rows={8}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="- 1depth 항목&#10;  - 2depth 항목"
                />
              </div>
            </div>

            {/* 차주 계획 섹션 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">차주 계획</h3>
                <label className="flex items-center space-x-1 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showNextWeekAchievement}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        showNextWeekAchievement: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>진척률 텍스트 표시</span>
                </label>
              </div>

              {/* 차주 수치 입력 */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    총 개수
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.nextTotalCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nextTotalCount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    완료 개수
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.nextCompletedCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nextCompletedCount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    진척률 (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.nextProgress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nextProgress: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 차주 계획 내용 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  계획 내용
                </label>
                <textarea
                  value={formData.nextWeekContent}
                  onChange={(e) =>
                    setFormData({ ...formData, nextWeekContent: e.target.value })
                  }
                  rows={8}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="- 1depth 항목&#10;  - 2depth 항목"
                />
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? '저장 중...' : editTask ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
