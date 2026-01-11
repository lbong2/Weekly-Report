'use client';

import { Attendance } from '@/types';
import { useMemo, useState } from 'react';

interface AttendanceCalendarProps {
  attendances: Attendance[];
  onEdit?: (attendance: Attendance) => void;
  onDelete?: (attendanceId: string) => void;
}

export function AttendanceCalendar({
  attendances,
  onEdit,
  onDelete,
}: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 현재 월의 첫날과 마지막날
  const { year, month, firstDay, lastDay, daysInMonth, startDayOfWeek } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = 일요일

    return { year, month, firstDay, lastDay, daysInMonth, startDayOfWeek };
  }, [currentDate]);

  // 날짜별 출결 데이터 매핑
  const attendancesByDate = useMemo(() => {
    const map = new Map<string, Attendance[]>();

    attendances.forEach((attendance) => {
      const startDate = new Date(attendance.startDate);
      const endDate = new Date(attendance.endDate);

      // 시작일부터 종료일까지 모든 날짜에 추가
      let currentDay = new Date(startDate);
      while (currentDay <= endDate) {
        const dateKey = currentDay.toISOString().split('T')[0];
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(attendance);
        currentDay.setDate(currentDay.getDate() + 1);
      }
    });

    return map;
  }, [attendances]);

  // 이전 달
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // 다음 달
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // 오늘로 이동
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // 달력 렌더링을 위한 날짜 배열 생성
  const calendarDays = useMemo(() => {
    const days = [];
    // 이전 달의 빈 칸
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    // 현재 달의 날짜
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  }, [startDayOfWeek, daysInMonth]);

  // 출결 타입별 색상
  const getTypeColor = (category: string) => {
    if (category === 'LEAVE') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (category === 'BUSINESS_TRIP') return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {year}년 {month + 1}월
          </h2>
          <button
            onClick={handleToday}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            오늘
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            ←
          </button>
          <button
            onClick={handleNextMonth}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div
            key={day}
            className={`p-2 text-center text-sm font-medium ${
              index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 달력 본문 */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="min-h-24 border-b border-r border-gray-200" />;
          }

          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayAttendances = attendancesByDate.get(dateKey) || [];
          const isToday = new Date().toISOString().split('T')[0] === dateKey;
          const dayOfWeek = (startDayOfWeek + day - 1) % 7;

          return (
            <div
              key={day}
              className={`min-h-24 border-b border-r border-gray-200 p-2 ${
                isToday ? 'bg-blue-50' : ''
              }`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  dayOfWeek === 0
                    ? 'text-red-600'
                    : dayOfWeek === 6
                    ? 'text-blue-600'
                    : 'text-gray-700'
                } ${isToday ? 'font-bold' : ''}`}
              >
                {day}
              </div>
              <div className="space-y-1">
                {dayAttendances.slice(0, 3).map((attendance) => (
                  <div
                    key={attendance.id}
                    className={`text-xs px-1.5 py-0.5 rounded border truncate cursor-pointer hover:opacity-80 ${getTypeColor(
                      attendance.type.category
                    )}`}
                    onClick={() => onEdit?.(attendance)}
                    title={`${attendance.user.name} - ${attendance.type.name}`}
                  >
                    {attendance.user.name} {attendance.type.name}
                  </div>
                ))}
                {dayAttendances.length > 3 && (
                  <div className="text-xs text-gray-500 px-1.5">
                    +{dayAttendances.length - 3}개 더
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
