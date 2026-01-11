'use client';

import { useState, useEffect } from 'react';
import { Team } from '@/types/models';
import { CreateTeamRequest, UpdateTeamRequest } from '@/types/api';

interface TeamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTeamRequest | UpdateTeamRequest) => Promise<void>;
  editTeam: Team | null;
}

export function TeamFormModal({
  isOpen,
  onClose,
  onSubmit,
  editTeam,
}: TeamFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    totalMembers: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (editTeam) {
      setFormData({
        name: editTeam.name,
        location: editTeam.location || '',
        totalMembers: editTeam.totalMembers,
      });
    } else {
      setFormData({
        name: '',
        location: '',
        totalMembers: 0,
      });
    }
    setError(null);
  }, [isOpen, editTeam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      console.error('저장 실패:', err);
      const errorMsg = err.response?.data?.message;
      const displayError = Array.isArray(errorMsg)
        ? errorMsg.join(', ')
        : errorMsg || err.message || '저장에 실패했습니다.';
      setError(displayError);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editTeam ? '팀 수정' : '팀 추가'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* 팀명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  팀명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 위치 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  위치
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 총 인원 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  총 인원 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.totalMembers}
                  onChange={(e) =>
                    setFormData({ ...formData, totalMembers: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={isLoading}
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                disabled={isLoading}
              >
                {isLoading ? '저장 중...' : editTeam ? '수정' : '추가'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
