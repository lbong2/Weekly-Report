'use client';

import { useEffect, useState } from 'react';
import { attendanceTypesApi } from '@/lib/api/attendance-types';
import { usersApi } from '@/lib/api/users';
import type {
  Attendance,
  AttendanceType,
  User,
  CreateAttendanceRequest,
} from '@/types';

interface AttendanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAttendanceRequest) => Promise<void>;
  editAttendance?: Attendance | null;
}

/**
 * 인원현황 추가/수정 모달
 */
export function AttendanceFormModal({
  isOpen,
  onClose,
  onSubmit,
  editAttendance,
}: AttendanceFormModalProps) {
  const [attendanceTypes, setAttendanceTypes] = useState<AttendanceType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<CreateAttendanceRequest>({
    userId: '',
    typeId: '',
    content: '',
    startDate: '',
    endDate: '',
    location: '',
    remarks: '',
  });

  // 선택된 유형 정보
  const selectedType = attendanceTypes.find((t) => t.id === formData.typeId);
  const isLeaveSelected = selectedType?.category === 'LEAVE';

  // 모달이 열릴 때 데이터 로드
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // 수정 모드일 때 폼 데이터 채우기
  useEffect(() => {
    if (editAttendance) {
      setFormData({
        userId: editAttendance.userId,
        typeId: editAttendance.typeId,
        content: editAttendance.content || '',
        startDate: editAttendance.startDate.split('T')[0], // ISO 날짜를 YYYY-MM-DD로 변환
        endDate: editAttendance.endDate.split('T')[0],     // ISO 날짜를 YYYY-MM-DD로 변환
        location: editAttendance.location || '',
        remarks: editAttendance.remarks || '',
      });
    } else {
      // 추가 모드일 때 초기화
      setFormData({
        userId: '',
        typeId: '',
        content: '',
        startDate: '',
        endDate: '',
        location: '',
        remarks: '',
      });
    }
  }, [editAttendance]);

  useEffect(() => {
    if (isLeaveSelected) {
      setFormData((prev) => ({
        ...prev,
        content: '',
        remarks: '',
        location: '',
      }));
    }
  }, [isLeaveSelected]);

  const loadData = async () => {
    try {
      const [typesData, usersData] = await Promise.all([
        attendanceTypesApi.getList({ isActive: true }), // 활성화된 유형만
        usersApi.getList(),
      ]);
      setAttendanceTypes(typesData);
      setUsers(usersData);
    } catch (err) {
      console.error('데이터 로딩 실패:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.userId) {
      alert('사용자를 선택해주세요.');
      return;
    }
    if (!formData.typeId) {
      alert('출결 유형을 선택해주세요.');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      alert('기간을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      alert(err.message || '인원현황 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {editAttendance ? '인원현황 수정' : '인원현황 추가'}
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
          {/* 사용자 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사용자 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.userId}
              onChange={(e) =>
                setFormData({ ...formData, userId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">선택하세요</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* 출결 유형 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출결 유형 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.typeId}
              onChange={(e) =>
                setFormData({ ...formData, typeId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">선택하세요</option>
              {/* 휴가 유형 */}
              <optgroup label="휴가">
                {attendanceTypes
                  .filter((t) => t.category === 'LEAVE')
                  .map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                      {type.isLongTerm && ' (장기)'}
                    </option>
                  ))}
              </optgroup>
              {/* 출장 유형 */}
              <optgroup label="출장">
                {attendanceTypes
                  .filter((t) => t.category === 'BUSINESS_TRIP')
                  .map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                      {type.isLongTerm && ' (장기)'}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* 기간 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <input
              type="text"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="예: 연차 사용, 가족 행사 등"
              disabled={isLeaveSelected}
            />
          </div>

          {/* 위치 (출장인 경우만 표시) */}
          {selectedType?.category === 'BUSINESS_TRIP' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                출장 위치
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 서울 본사, 광양 제철소 등"
              />
            </div>
          )}

          {/* 비고 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비고
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="추가 메모사항"
              disabled={isLeaveSelected}
            />
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
              {isLoading ? '저장 중...' : editAttendance ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
