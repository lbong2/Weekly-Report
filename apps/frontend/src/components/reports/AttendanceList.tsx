'use client';

import { Attendance } from '@/types';

interface AttendanceListProps {
  attendances: Attendance[];
  onEdit?: (attendance: Attendance) => void;
  onDelete?: (attendanceId: string) => void;
  emptyMessage?: string;
  emptyHint?: string;
}

/**
 * 인원현황 목록 컴포넌트
 */
export function AttendanceList({
  attendances,
  onEdit,
  onDelete,
  emptyMessage = '등록된 인원현황이 없습니다.',
  emptyHint = '인원현황 추가 버튼을 눌러 휴가/출장 정보를 등록하세요.',
}: AttendanceListProps) {
  // 카테고리별로 그룹화
  const leaves = attendances.filter((a) => a.type.category === 'LEAVE');
  const businessTrips = attendances.filter(
    (a) => a.type.category === 'BUSINESS_TRIP'
  );

  if (attendances.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{emptyMessage}</p>
        {emptyHint && <p className="text-sm mt-2">{emptyHint}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 휴가 섹션 */}
      {leaves.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            휴가
          </h3>
          <div className="space-y-3">
            {leaves.map((attendance) => (
              <AttendanceItem
                key={attendance.id}
                attendance={attendance}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* 출장 섹션 */}
      {businessTrips.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            출장
          </h3>
          <div className="space-y-3">
            {businessTrips.map((attendance) => (
              <AttendanceItem
                key={attendance.id}
                attendance={attendance}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 인원현황 항목 컴포넌트
 */
function AttendanceItem({
  attendance,
  onEdit,
  onDelete,
}: {
  attendance: Attendance;
  onEdit?: (attendance: Attendance) => void;
  onDelete?: (attendanceId: string) => void;
}) {
  const formatDate = (value: string) => value.split('T')[0];

  return (
    <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          {/* 사용자 이름 */}
          <span className="font-semibold text-gray-900">
            {attendance.user.name}
          </span>

          {/* 유형 */}
          <span
            className={`inline-block px-2 py-1 text-xs font-medium rounded ${
              attendance.type.category === 'LEAVE'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {attendance.type.name}
          </span>

          {/* 장기 뱃지 */}
          {attendance.type.isLongTerm && (
            <span className="inline-block px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded">
              장기
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {/* 기간 */}
          <div className="text-gray-600">
            <span className="font-medium text-gray-700">기간:</span>{' '}
            {formatDate(attendance.startDate)} ~ {formatDate(attendance.endDate)}
          </div>

          {/* 위치 (출장인 경우) */}
          {attendance.location && (
            <div className="text-gray-600">
              <span className="font-medium text-gray-700">위치:</span>{' '}
              {attendance.location}
            </div>
          )}

          {/* 내용 */}
          {attendance.content && (
            <div className="text-gray-600 col-span-2">
              <span className="font-medium text-gray-700">내용:</span>{' '}
              {attendance.content}
            </div>
          )}

          {/* 비고 */}
          {attendance.remarks && (
            <div className="text-gray-600 col-span-2">
              <span className="font-medium text-gray-700">비고:</span>{' '}
              {attendance.remarks}
            </div>
          )}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2 ml-4">
        {onEdit && (
          <button
            onClick={() => onEdit(attendance)}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            수정
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => {
              if (confirm('이 인원현황을 삭제하시겠습니까?')) {
                onDelete(attendance.id);
              }
            }}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
