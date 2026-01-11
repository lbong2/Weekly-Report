'use client';

import { useState, useEffect } from 'react';
import { AttendanceType, AttendanceCategory } from '@/types/models';
import {
  CreateAttendanceTypeRequest,
  UpdateAttendanceTypeRequest,
} from '@/types/api';

interface AttendanceTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateAttendanceTypeRequest | UpdateAttendanceTypeRequest,
  ) => Promise<void>;
  editType: AttendanceType | null;
}

const categoryOptions: { label: string; value: AttendanceCategory }[] = [
  { label: '휴가', value: 'LEAVE' },
  { label: '출장', value: 'BUSINESS_TRIP' },
];

export function AttendanceTypeFormModal({
  isOpen,
  onClose,
  onSubmit,
  editType,
}: AttendanceTypeFormModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'LEAVE' as AttendanceCategory,
    isLongTerm: false,
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (editType) {
      setFormData({
        code: editType.code,
        name: editType.name,
        category: editType.category,
        isLongTerm: editType.isLongTerm,
        isActive: editType.isActive,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        category: 'LEAVE',
        isLongTerm: false,
        isActive: true,
      });
    }
    setError(null);
  }, [isOpen, editType]);

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
            {editType ? '출결 유형 수정' : '출결 유형 추가'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  코드 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ANNUAL"
                />
              </div>

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
                  placeholder="연차"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  구분 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as AttendanceCategory,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    id="isLongTerm"
                    type="checkbox"
                    checked={formData.isLongTerm}
                    onChange={(e) =>
                      setFormData({ ...formData, isLongTerm: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isLongTerm"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    장기
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    활성
                  </label>
                </div>
              </div>
            </div>

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
                {isLoading ? '저장 중...' : editType ? '수정' : '추가'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
