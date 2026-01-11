'use client';

import { useState, useEffect } from 'react';
import { attendanceTypesApi } from '@/lib/api/attendance-types';
import { AttendanceType } from '@/types/models';
import {
  CreateAttendanceTypeRequest,
  UpdateAttendanceTypeRequest,
} from '@/types/api';
import { AttendanceTypeFormModal } from '@/components/admin/AttendanceTypeFormModal';

const categoryMap = {
  LEAVE: '휴가',
  BUSINESS_TRIP: '출장',
};

export default function AttendanceTypesPage() {
  const [types, setTypes] = useState<AttendanceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<AttendanceType | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // 백엔드 컨트롤러가 includeInactive 쿼리를 받으므로 true로 설정
      const typesData = await attendanceTypesApi.getList({
        isActive: undefined,
      });
      setTypes(typesData);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingType(null);
    setIsModalOpen(true);
  };

  const handleEdit = (type: AttendanceType) => {
    setEditingType(type);
    setIsModalOpen(true);
  };

  const handleDelete = async (type: AttendanceType) => {
    if (!confirm(`'${type.name}' 유형을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await attendanceTypesApi.delete(type.id);
      alert('유형이 삭제되었습니다.');
      loadData();
    } catch (err: any) {
      console.error('삭제 실패:', err);
      alert(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async (
    data: CreateAttendanceTypeRequest | UpdateAttendanceTypeRequest,
  ) => {
    try {
      if (editingType) {
        await attendanceTypesApi.update(editingType.id, data as UpdateAttendanceTypeRequest);
        alert('유형이 수정되었습니다.');
      } else {
        await attendanceTypesApi.create(data as CreateAttendanceTypeRequest);
        alert('유형이 추가되었습니다.');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      throw err; // FormModal에서 처리
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">출결 유형 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            총 {types.length}개의 유형
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + 유형 추가
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                코드
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                구분
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                장기
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {types.map((type) => (
              <tr key={type.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {type.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {type.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {categoryMap[type.category]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {type.isLongTerm ? 'O' : 'X'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {type.isActive ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      활성
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      비활성
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(type)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(type)}
                    className="text-red-600 hover:text-red-900"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {types.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            등록된 유형이 없습니다.
          </div>
        )}
      </div>

      <AttendanceTypeFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingType(null);
        }}
        onSubmit={handleSubmit}
        editType={editingType}
      />
    </div>
  );
}
