'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { reportsApi } from '@/lib/api/reports';
import CreateReportModal from '@/components/reports/CreateReportModal';
import type { WeeklyReport, ReportStatus } from '@/types';

/**
 * 주간보고서 목록 페이지
 */
export default function ReportsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('DRAFT');

  // 주간보고서 목록 조회
  useEffect(() => {
    const loadReports = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await reportsApi.getList();
        setReports(data);
      } catch (err: any) {
        setError(err.message || '주간보고서를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, []);

  // 주간보고서 생성 모달 열기
  const handleCreate = () => {
    console.log('User:', user);
    console.log('Team ID:', user?.team?.id);
    if (!user?.team?.id) {
      alert('팀 정보를 찾을 수 없습니다. 로그아웃 후 다시 로그인해주세요.');
      return;
    }
    setIsModalOpen(true);
  };

  // 주간보고서 생성 API 호출
  const handleCreateReport = async (data: {
    year: number;
    weekNumber: number;
    weekStart: string;
    weekEnd: string;
  }) => {
    if (!user?.team?.id) {
      throw new Error('팀 정보를 찾을 수 없습니다.');
    }

    const payload = {
      teamId: user.team.id,
      year: data.year,
      weekNumber: data.weekNumber,
      weekStart: data.weekStart,
      weekEnd: data.weekEnd,
    };

    console.log('Creating report with payload:', payload);

    const newReport = await reportsApi.create(payload);

    // 목록에 추가하고 상세 페이지로 이동
    setReports([newReport, ...reports]);
    router.push(`/reports/${newReport.id}`);
  };

  // 주간보고서 상세로 이동
  const handleViewReport = (id: string) => {
    router.push(`/reports/${id}`);
  };

  // 상태별 필터링 및 정렬
  const filteredReports = useMemo(() => {
    let filtered = reports;
    if (statusFilter !== 'ALL') {
      filtered = reports.filter(report => report.status === statusFilter);
    }

    // 연도와 주차 기준 오름차순 정렬 (과거순)
    return filtered.sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year; // 연도 오름차순
      }
      return a.weekNumber - b.weekNumber; // 주차 오름차순
    });
  }, [reports, statusFilter]);

  // 상태별 옵션
  const statusOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'DRAFT', label: '작성중' },
    { value: 'COMPLETED', label: '완료' },
  ];

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">주간보고서 목록</h1>
          <p className="mt-1 text-sm text-gray-600">
            {user?.team?.name}의 주간보고서를 관리합니다
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          새 주간보고서 작성
        </button>
      </div>

      {/* 상태 필터 */}
      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
          상태:
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'ALL')}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500">
          {filteredReports.length}개의 보고서
        </span>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      )}

      {/* 에러 */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* 빈 목록 */}
      {!isLoading && !error && reports.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">아직 작성된 주간보고서가 없습니다.</p>
          <button
            onClick={handleCreate}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            첫 주간보고서 작성하기
          </button>
        </div>
      )}

      {/* 주간보고서 목록 */}
      {!isLoading && !error && filteredReports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => handleViewReport(report.id)}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {report.year}년 {report.weekNumber}주차
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {report.weekStart.split('T')[0]} ~ {report.weekEnd.split('T')[0]}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    report.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {report.status === 'COMPLETED' ? '완료' : '작성중'}
                </span>
              </div>

              <div className="text-sm text-gray-600">
                <p>팀: {report.team?.name || '-'}</p>
                <p className="mt-1">
                  작성일: {report.createdAt.split('T')[0]}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 생성 모달 */}
      <CreateReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateReport}
        teamId={user?.team?.id || ''}
      />
    </div>
  );
}
