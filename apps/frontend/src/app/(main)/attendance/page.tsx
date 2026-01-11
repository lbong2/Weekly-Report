'use client';

import { useEffect, useState } from 'react';
import { attendancesApi } from '@/lib/api/attendances';
import { AttendanceFormModal } from '@/components/reports/AttendanceFormModal';
import { AttendanceList } from '@/components/reports/AttendanceList';
import { AttendanceCalendar } from '@/components/reports/AttendanceCalendar';
import type { Attendance, CreateAttendanceRequest } from '@/types';

type ViewMode = 'list' | 'calendar';

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(
    null
  );

  const loadAttendances = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await attendancesApi.getList();
      setAttendances(data);
    } catch (err: any) {
      setError(err.message || '출장/연차 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendances();
  }, []);

  const handleAttendanceSubmit = async (data: CreateAttendanceRequest) => {
    if (editingAttendance) {
      await attendancesApi.update(editingAttendance.id, data);
    } else {
      await attendancesApi.create(data);
    }
    await loadAttendances();
  };

  const handleAddAttendance = () => {
    setEditingAttendance(null);
    setIsAttendanceModalOpen(true);
  };

  const handleEditAttendance = (attendance: Attendance) => {
    setEditingAttendance(attendance);
    setIsAttendanceModalOpen(true);
  };

  const handleDeleteAttendance = async (attendanceId: string) => {
    try {
      await attendancesApi.delete(attendanceId);
      await loadAttendances();
    } catch (err: any) {
      alert(err.message || '출장/연차 삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">출장/연차 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            주차와 상관없이 출장 및 연차를 등록합니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* 뷰 모드 토글 */}
          <div className="flex items-center bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              목록
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              달력
            </button>
          </div>

          <button
            onClick={handleAddAttendance}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            + 추가
          </button>
        </div>
      </div>

      {/* 뷰 모드에 따라 다른 컴포넌트 렌더링 */}
      {viewMode === 'list' ? (
        <AttendanceList
          attendances={attendances}
          onEdit={handleEditAttendance}
          onDelete={handleDeleteAttendance}
          emptyMessage="등록된 출장/연차가 없습니다."
          emptyHint="오른쪽 상단의 추가 버튼으로 등록할 수 있습니다."
        />
      ) : (
        <AttendanceCalendar
          attendances={attendances}
          onEdit={handleEditAttendance}
          onDelete={handleDeleteAttendance}
        />
      )}

      <AttendanceFormModal
        isOpen={isAttendanceModalOpen}
        onClose={() => {
          setIsAttendanceModalOpen(false);
          setEditingAttendance(null);
        }}
        onSubmit={handleAttendanceSubmit}
        editAttendance={editingAttendance}
      />
    </div>
  );
}
