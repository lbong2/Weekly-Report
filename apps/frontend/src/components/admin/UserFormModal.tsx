'use client';

import { useState, useEffect } from 'react';
import { User, Team, Role, Position } from '@/types/models';
import { CreateUserRequest, UpdateUserRequest } from '@/types/api';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  editUser: User | null;
  teams: Team[];
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  editUser,
  teams,
}: UserFormModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    teamId: '',
    role: 'USER' as Role,
    position: 'STAFF' as Position,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (editUser) {
      setFormData({
        email: editUser.email,
        password: '', // 비밀번호는 비워둠
        name: editUser.name,
        teamId: editUser.teamId,
        role: editUser.role,
        position: editUser.position,
      });
    } else {
      setFormData({
        email: '',
        password: '',
        name: '',
        teamId: teams[0]?.id || '',
        role: 'USER',
        position: 'STAFF',
      });
    }
    setError(null);
  }, [isOpen, editUser, teams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 팀 선택 검증
    if (!formData.teamId) {
      setError('팀을 선택해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      if (editUser) {
        // 수정: 비밀번호가 비어있으면 제외, 빈 값 필드도 제외
        const updateData: UpdateUserRequest = {};

        if (formData.email?.trim()) updateData.email = formData.email.trim();
        if (formData.name?.trim()) updateData.name = formData.name.trim();
        if (formData.teamId?.trim()) updateData.teamId = formData.teamId.trim();
        if (formData.role) updateData.role = formData.role;
        if (formData.position) updateData.position = formData.position;
        // 비밀번호는 값이 있고 공백이 아닐 때만 포함
        if (formData.password?.trim().length > 0) {
          updateData.password = formData.password.trim();
        }

        console.log('수정 요청 데이터:', updateData);
        await onSubmit(updateData);
      } else {
        // 추가: 비밀번호 필수
        if (!formData.password) {
          setError('비밀번호를 입력해주세요.');
          setIsLoading(false);
          return;
        }
        console.log('추가 요청 데이터:', formData);
        await onSubmit(formData as CreateUserRequest);
      }
      onClose();
    } catch (err: any) {
      console.error('저장 실패:', err);
      console.error('에러 상세:', err.response?.data);

      // 배열 형태의 메시지 처리
      const errorMsg = err.response?.data?.message;
      console.log('에러 메시지 타입:', typeof errorMsg, errorMsg);

      if (Array.isArray(errorMsg)) {
        console.log('에러 메시지 배열:', errorMsg);
        errorMsg.forEach((msg, i) => console.log(`  [${i}]:`, msg));
      }

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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editUser ? '사용자 수정' : '사용자 추가'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* 이메일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 비밀번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 {editUser ? '(변경 시만 입력)' : <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  required={!editUser}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={editUser ? '변경하지 않으려면 비워두세요' : ''}
                />
                {!editUser && (
                  <p className="mt-1 text-xs text-gray-500">최소 6자 이상</p>
                )}
              </div>

              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 <span className="text-red-500">*</span>
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

              {/* 팀 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  팀 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.teamId}
                  onChange={(e) =>
                    setFormData({ ...formData, teamId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {!editUser && <option value="">팀 선택</option>}
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 직책 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  직책 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value as Position })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="STAFF">사원</option>
                  <option value="MANAGER">매니저</option>
                  <option value="TEAM_LEAD">팀장</option>
                </select>
              </div>

              {/* 권한 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  권한 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as Role })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USER">일반 사용자</option>
                  <option value="ADMIN">관리자</option>
                </select>
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
                {isLoading ? '저장 중...' : editUser ? '수정' : '추가'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
