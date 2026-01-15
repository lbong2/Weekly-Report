'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { reportsApi } from '@/lib/api/reports';
import { tasksApi } from '@/lib/api/tasks';
import { attendancesApi } from '@/lib/api/attendances';
import { issuesApi } from '@/lib/api/issues';
import { TaskList } from '@/components/reports/TaskList';
import { TaskFormModal } from '@/components/reports/TaskFormModal';
import { AttendanceList } from '@/components/reports/AttendanceList';
import { AttendanceWeeklyCalendar } from '@/components/reports/AttendanceWeeklyCalendar';
import type {
  WeeklyReport,
  Task,
  CreateTaskRequest,
  Attendance,
} from '@/types';
import { useAuth } from '@/lib/hooks/useAuth';

type AttendanceViewMode = 'list' | 'calendar';
type TaskViewMode = 'personal' | 'team';

/**
 * 주간보고서 상세 페이지
 */
export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  const { user, isAdmin } = useAuth();

  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [nextAttendances, setNextAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'attendance'>('tasks');
  const [attendanceViewMode, setAttendanceViewMode] = useState<AttendanceViewMode>('list');
  // 업무 보기 모드: 관리자는 팀 실적, 일반 사용자는 개인 실적이 기본
  const [taskViewMode, setTaskViewMode] = useState<TaskViewMode>(isAdmin ? 'team' : 'personal');

  // 업무 모달
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // 주간보고서 조회
  useEffect(() => {
    const loadReport = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await reportsApi.getOne(reportId);
        setReport(data);
      } catch (err: any) {
        setError(err.message || '주간보고서를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [reportId]);

  // 업무 목록 조회
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await tasksApi.getList({ weeklyReportId: reportId });
        setTasks(data);
      } catch (err: any) {
        console.error('업무 목록 로딩 실패:', err);
      }
    };

    loadTasks();
  }, [reportId]);

  // 인원현황 목록 조회
  useEffect(() => {
    const loadAttendances = async () => {
      try {
        if (!report) return;
        const startDate = formatDate(report.weekStart);
        const endDate = formatDate(report.weekEnd);
        const data = await attendancesApi.getList({ startDate, endDate });
        setAttendances(data);
      } catch (err: any) {
        console.error('인원현황 목록 로딩 실패:', err);
      }
    };

    loadAttendances();
  }, [report]);

  // 다음 주차 인원현황 목록 조회
  useEffect(() => {
    if (!report) {
      setNextAttendances([]);
      return;
    }

    const loadNextAttendances = async () => {
      try {
        const nextWeekStart = new Date(report.weekStart);
        nextWeekStart.setDate(nextWeekStart.getDate() + 7);
        const nextWeekEnd = new Date(report.weekEnd);
        nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
        const startDate = formatDate(nextWeekStart);
        const endDate = formatDate(nextWeekEnd);
        const data = await attendancesApi.getList({ startDate, endDate });
        setNextAttendances(data);
      } catch (err: any) {
        console.error('다음 주차 인원현황 로딩 실패:', err);
      }
    };

    loadNextAttendances();
  }, [report]);

  // 업무 목록 새로고침
  const refreshTasks = async () => {
    try {
      const data = await tasksApi.getList({ weeklyReportId: reportId });
      setTasks(data);
    } catch (err: any) {
      console.error('업무 목록 새로고침 실패:', err);
    }
  };

  // 업무 추가/수정 처리
  const handleTaskSubmit = async (data: CreateTaskRequest) => {
    if (editingTask) {
      // 수정 - weeklyReportId 제외
      const { weeklyReportId, ...updateData } = data;
      await tasksApi.update(editingTask.id, updateData);
    } else {
      // 추가
      await tasksApi.create(data);
    }
    await refreshTasks();
  };

  // 업무 추가 버튼 클릭
  const handleAddTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  // 업무 수정 버튼 클릭
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // 업무 삭제
  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksApi.delete(taskId);
      await refreshTasks();
    } catch (err: any) {
      alert(err.message || '업무 삭제에 실패했습니다.');
    }
  };

  // PPT 내보내기
  const handleExportPpt = async () => {
    try {
      const blob = await reportsApi.exportPptx(reportId);

      // 파일 다운로드
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `주간보고_${report?.year}년_${report?.weekNumber}주차.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'PPT 내보내기에 실패했습니다.');
    }
  };

  // 보고서 상태 변경
  const handleToggleStatus = async () => {
    try {
      const newStatus = report?.status === 'DRAFT' ? 'COMPLETED' : 'DRAFT';
      const confirmMessage = newStatus === 'COMPLETED'
        ? '보고서를 완료 처리하시겠습니까?'
        : '보고서를 작성중으로 변경하시겠습니까?';

      if (!confirm(confirmMessage)) return;

      await reportsApi.update(reportId, { status: newStatus });

      // 보고서 정보 새로고침
      const updatedReport = await reportsApi.getOne(reportId);
      setReport(updatedReport);

      alert('상태가 변경되었습니다.');
    } catch (err: any) {
      alert(err.message || '상태 변경에 실패했습니다.');
    }
  };

  const formatDate = (value: string | Date) => {
    const date = value instanceof Date ? value : new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const nextWeekStart = report ? new Date(report.weekStart) : null;
  const nextWeekEnd = report ? new Date(report.weekEnd) : null;
  if (nextWeekStart) {
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
  }
  if (nextWeekEnd) {
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
  }

  // 로딩
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러
  if (error || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">{error || '주간보고서를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => router.push('/reports')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/reports')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← 목록
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {report.year}년 {report.weekNumber}주차 주간보고서
          </h1>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <p>기간: {report.weekStart.split('T')[0]} ~ {report.weekEnd.split('T')[0]}</p>
            <p className="mt-1">팀: {report.team?.name || '-'}</p>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 text-sm rounded-full ${report.status === 'COMPLETED'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
                }`}
            >
              {report.status === 'COMPLETED' ? '완료' : '작성중'}
            </span>
            <button
              onClick={handleToggleStatus}
              className={`px-4 py-2 rounded-md transition-colors ${
                report.status === 'DRAFT'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {report.status === 'DRAFT' ? '완료 처리' : '작성중으로 변경'}
            </button>
            <button
              onClick={handleExportPpt}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              PPT 내보내기
            </button>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tasks'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            업무 실적/계획
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'attendance'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            인원현황
          </button>
        </nav>
      </div>

      {/* 탭 컨텐츠 */}
      <div>
        {activeTab === 'tasks' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">업무 목록</h2>
                <select
                  value={taskViewMode}
                  onChange={(e) => setTaskViewMode(e.target.value as TaskViewMode)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="personal">개인 실적</option>
                  <option value="team">팀 실적</option>
                </select>
              </div>
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                + 업무 추가
              </button>
            </div>
            <TaskList
              tasks={taskViewMode === 'personal' && user
                ? tasks.filter(task => task.assignees?.some(a => a.userId === user.id))
                : tasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onFinishIssue={async (issueId) => {
                try {
                  await issuesApi.update(issueId, { status: 'DONE' });
                  alert('관련 이슈가 종료 처리되었습니다.');
                  await refreshTasks(); // 목록 갱신 (Issue 상태 반영)
                } catch (err: any) {
                  alert(err.message || '이슈 종료 처리에 실패했습니다.');
                }
              }}
              onPromoteIssue={async (task) => {
                try {
                  // 1. 이슈 생성
                  const newIssue = await issuesApi.create({
                    title: task.title,
                    chainId: task.chainId,
                    status: 'IN_PROGRESS',
                    purpose: task.purpose,
                    startDate: task.startDate,
                    endDate: task.endDate,
                    totalCount: task.totalCount,
                    completedCount: task.completedCount,
                    progress: task.progress,
                    assigneeIds: task.assignees?.map(a => a.userId) || []
                  });

                  // 2. 업무에 이슈 연결
                  await tasksApi.update(task.id, { issueId: newIssue.id });

                  alert('이슈로 등록되었습니다.');
                  await refreshTasks();
                } catch (err: any) {
                  alert(err.message || '이슈 등록에 실패했습니다.');
                }
              }}
            />
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">인원현황 요약</h2>
                <p className="text-sm text-gray-600 mt-1">
                  선택한 주차와 다음 주차의 출장/연차 현황을 표시합니다.
                </p>
              </div>
              {/* 뷰 모드 토글 */}
              <div className="flex items-center bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setAttendanceViewMode('list')}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    attendanceViewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  목록
                </button>
                <button
                  onClick={() => setAttendanceViewMode('calendar')}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    attendanceViewMode === 'calendar'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  달력
                </button>
              </div>
            </div>

            {attendanceViewMode === 'list' ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <section className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    이번 주 ({report.year}년 {report.weekNumber}주차)
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {formatDate(report.weekStart)} ~ {formatDate(report.weekEnd)}
                  </p>
                  <AttendanceList
                    attendances={attendances}
                    emptyHint=""
                  />
                </section>

                <section className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    다음 주 ({nextWeekStart ? `${nextWeekStart.getFullYear()}년 ${report.weekNumber + 1}주차` : '미정'})
                  </h3>
                  {nextWeekStart && nextWeekEnd ? (
                    <>
                      <p className="text-sm text-gray-500 mb-4">
                        {formatDate(nextWeekStart)} ~ {formatDate(nextWeekEnd)}
                      </p>
                      <AttendanceList
                        attendances={nextAttendances}
                        emptyHint=""
                      />
                    </>
                  ) : null}
                </section>
              </div>
            ) : (
              nextWeekStart && nextWeekEnd && (
                <AttendanceWeeklyCalendar
                  thisWeekAttendances={attendances}
                  nextWeekAttendances={nextAttendances}
                  weekStart={new Date(report.weekStart)}
                  weekEnd={new Date(report.weekEnd)}
                  nextWeekStart={nextWeekStart}
                  nextWeekEnd={nextWeekEnd}
                  year={report.year}
                  weekNumber={report.weekNumber}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* 업무 추가/수정 모달 */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        weeklyReportId={reportId}
        editTask={editingTask}
      />

    </div>
  );
}
