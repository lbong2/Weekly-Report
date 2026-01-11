'use client';

import { Attendance } from '@/types';
import { useMemo } from 'react';

interface AttendanceWeeklyCalendarProps {
  thisWeekAttendances: Attendance[];
  nextWeekAttendances: Attendance[];
  weekStart: Date;
  weekEnd: Date;
  nextWeekStart: Date;
  nextWeekEnd: Date;
  year: number;
  weekNumber: number;
}

export function AttendanceWeeklyCalendar({
  thisWeekAttendances,
  nextWeekAttendances,
  weekStart,
  weekEnd,
  nextWeekStart,
  nextWeekEnd,
  year,
  weekNumber,
}: AttendanceWeeklyCalendarProps) {
  // 날짜별 출결 데이터 매핑
  const getAttendancesByDate = (attendances: Attendance[]) => {
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
  };

  const thisWeekMap = useMemo(() => getAttendancesByDate(thisWeekAttendances), [thisWeekAttendances]);
  const nextWeekMap = useMemo(() => getAttendancesByDate(nextWeekAttendances), [nextWeekAttendances]);

  // 주간 날짜 배열 생성 (월~금만)
  const getWeekDays = (start: Date, end: Date) => {
    const days = [];
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      // 월~금만 추가 (1=월요일, 5=금요일)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        days.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const thisWeekDays = useMemo(() => getWeekDays(weekStart, weekEnd), [weekStart, weekEnd]);
  const nextWeekDays = useMemo(() => getWeekDays(nextWeekStart, nextWeekEnd), [nextWeekStart, nextWeekEnd]);

  // 출결 타입별 색상
  const getTypeColor = (category: string) => {
    if (category === 'LEAVE') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (category === 'BUSINESS_TRIP') return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const renderWeekCalendar = (days: Date[], attendancesMap: Map<string, Attendance[]>, title: string) => {
    const today = new Date().toISOString().split('T')[0];

    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-5">
          {['월', '화', '수', '목', '금'].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium border-b border-r border-gray-200 text-gray-700"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 */}
        <div className="grid grid-cols-5">
          {days.map((date) => {
            const dateKey = date.toISOString().split('T')[0];
            const dayAttendances = attendancesMap.get(dateKey) || [];
            const isToday = today === dateKey;

            return (
              <div
                key={dateKey}
                className={`min-h-32 border-b border-r border-gray-200 p-2 ${
                  isToday ? 'bg-blue-50' : ''
                }`}
              >
                <div
                  className={`text-sm font-medium mb-1 text-gray-700 ${isToday ? 'font-bold' : ''}`}
                >
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayAttendances.map((attendance) => (
                    <div
                      key={attendance.id}
                      className={`text-xs px-1.5 py-0.5 rounded border truncate ${getTypeColor(
                        attendance.type.category
                      )}`}
                      title={`${attendance.user.name} - ${attendance.type.name}`}
                    >
                      {attendance.user.name} {attendance.type.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {renderWeekCalendar(
        thisWeekDays,
        thisWeekMap,
        `이번 주 (${year}년 ${weekNumber}주차)`
      )}
      {renderWeekCalendar(
        nextWeekDays,
        nextWeekMap,
        `다음 주 (${nextWeekStart.getFullYear()}년 ${weekNumber + 1}주차)`
      )}
    </div>
  );
}
