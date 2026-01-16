'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Task, ReportFile } from '@/types';
import { filesApi } from '@/lib/api/files';

interface TaskListProps {
  tasks: Task[];
  weeklyReportId: string;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onFinishIssue?: (issueId: string) => void;
  onPromoteIssue?: (task: Task) => void;
}

/**
 * 업무 목록 컴포넌트
 */
export function TaskList({ tasks, weeklyReportId, onEdit, onDelete, onFinishIssue, onPromoteIssue }: TaskListProps) {
  // 각 Task별 파일 목록 상태
  const [taskFiles, setTaskFiles] = useState<Record<string, ReportFile[]>>({});
  // 파일 영역 펼침 상태
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  // 업로드 중인 Task ID
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);

  // Task별 파일 목록 조회
  const loadTaskFiles = useCallback(async (taskId: string) => {
    try {
      const files = await filesApi.getListByTask(taskId);
      setTaskFiles(prev => ({ ...prev, [taskId]: files }));
    } catch (err) {
      console.error('파일 목록 로딩 실패:', err);
    }
  }, []);

  // 펼친 Task의 파일 목록 로드
  useEffect(() => {
    expandedTasks.forEach(taskId => {
      if (!taskFiles[taskId]) {
        loadTaskFiles(taskId);
      }
    });
  }, [expandedTasks, loadTaskFiles, taskFiles]);

  // 파일 영역 토글
  const toggleFileSection = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  // 파일 업로드 핸들러
  const handleFileUpload = async (taskId: string, file: File) => {
    setUploadingTaskId(taskId);
    try {
      await filesApi.upload(weeklyReportId, file, taskId);
      await loadTaskFiles(taskId);
    } catch (err: any) {
      alert(err.message || '파일 업로드에 실패했습니다.');
    } finally {
      setUploadingTaskId(null);
    }
  };

  // 파일 삭제 핸들러
  const handleFileDelete = async (taskId: string, fileId: string) => {
    if (!confirm('이 파일을 삭제하시겠습니까?')) return;
    try {
      await filesApi.delete(fileId);
      setTaskFiles(prev => ({
        ...prev,
        [taskId]: prev[taskId]?.filter(f => f.id !== fileId) || []
      }));
    } catch (err: any) {
      alert(err.message || '파일 삭제에 실패했습니다.');
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>등록된 업무가 없습니다.</p>
        <p className="text-sm mt-2">업무 추가 버튼을 눌러 업무를 등록하세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          {/* 헤더: 모듈명, 제목, 액션 버튼 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-block px-2 py-1 text-xs font-bold rounded"
                  style={{
                    backgroundColor: task.chain.color + '20',
                    color: task.chain.color,
                    border: `1.5px solid ${task.chain.color}`
                  }}
                >
                  {task.chain.name}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
              {task.purpose && (
                <p className="text-sm text-gray-600 mt-1">{task.purpose}</p>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              {onEdit && (
                <button
                  onClick={() => onEdit(task)}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  수정
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => {
                    if (confirm('이 업무를 삭제하시겠습니까?')) {
                      onDelete(task.id);
                    }
                  }}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  삭제
                </button>
              )}
              {onFinishIssue && task.issueId && task.issue?.status !== 'DONE' && (
                <button
                  onClick={() => {
                    if (confirm('이 업무와 관련된 이슈를 종료(완료) 처리하시겠습니까?')) {
                      onFinishIssue(task.issueId!);
                    }
                  }}
                  className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
                >
                  종료
                </button>
              )}
            </div>
          </div>

          {/* 정보 행: 일정, 진척률, 담당자 */}
          <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
            <div>
              <p className="text-xs text-gray-500 mb-1">일정</p>
              <p className="text-sm font-medium text-gray-900">
                {task.startDate && task.endDate
                  ? `${task.startDate.split('T')[0]} ~ ${task.endDate.split('T')[0]}`
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">진척률</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {task.progress}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {task.completedCount} / {task.totalCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">담당자</p>
              <div className="flex flex-wrap gap-1">
                {task.assignees && task.assignees.length > 0 ? (
                  task.assignees.map((assignee) => {
                    const positionColors =
                      assignee.user.position === 'TEAM_LEAD'
                        ? 'bg-purple-100 text-purple-800'
                        : assignee.user.position === 'MANAGER'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800';

                    return (
                      <span
                        key={assignee.id}
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded ${positionColors}`}
                      >
                        {assignee.user.name}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </div>
            </div>
          </div>

          {/* 내용: 금주 실적 / 차주 계획 */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                금주 실적
              </h4>
              {task.thisWeekContent ? (
                <div
                  className="text-sm text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(task.thisWeekContent),
                  }}
                />
              ) : (
                <p className="text-sm text-gray-400">내용 없음</p>
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                차주 계획
              </h4>
              {task.nextWeekContent ? (
                <div
                  className="text-sm text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(task.nextWeekContent),
                  }}
                />
              ) : (
                <p className="text-sm text-gray-400">내용 없음</p>
              )}
            </div>
          </div>

          {/* 첨부파일 섹션 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => toggleFileSection(task.id)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <svg
                className={`w-4 h-4 transition-transform ${expandedTasks.has(task.id) ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-medium">첨부파일</span>
              {taskFiles[task.id]?.length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {taskFiles[task.id].length}
                </span>
              )}
            </button>

            {expandedTasks.has(task.id) && (
              <div className="mt-3">
                {/* 파일 업로드 영역 */}
                <TaskFileUploader
                  taskId={task.id}
                  isUploading={uploadingTaskId === task.id}
                  onUpload={(file) => handleFileUpload(task.id, file)}
                />

                {/* 파일 목록 */}
                {taskFiles[task.id]?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {taskFiles[task.id].map(file => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <a
                          href={filesApi.getDownloadUrl(file.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {file.originalName}
                        </a>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </span>
                          <button
                            onClick={() => handleFileDelete(task.id, file.id)}
                            className="text-red-500 hover:text-red-700"
                            title="삭제"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Task 파일 업로더 컴포넌트
 */
function TaskFileUploader({
  taskId,
  isUploading,
  onUpload
}: {
  taskId: string;
  isUploading: boolean;
  onUpload: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = '';
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleChange}
        className="hidden"
        disabled={isUploading}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 border border-dashed border-gray-300 rounded hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
      >
        {isUploading ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            업로드 중...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            파일 추가
          </>
        )}
      </button>
    </div>
  );
}

/**
 * 파일 크기 포맷
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * 마크다운 텍스트를 HTML로 변환 (간단한 버전)
 * - 항목만 지원 (-, *, + 로 시작)
 * - 들여쓰기로 depth 구분
 */
function formatMarkdown(text: string): string {
  const lines = text.split('\n');
  let html = '<ul class="list-disc pl-5 space-y-1">';
  let prevDepth = 0;

  lines.forEach((line) => {
    const trimmed = line.trimEnd();
    if (!trimmed) return;

    // 들여쓰기 개수로 depth 계산 (2칸당 1depth)
    const leadingSpaces = line.length - line.trimStart().length;
    const depth = Math.floor(leadingSpaces / 2);

    // 리스트 마커 제거
    const content = line.trim().replace(/^[-*+]\s+/, '');

    // depth 변경 시 ul 열고 닫기
    if (depth > prevDepth) {
      for (let i = 0; i < depth - prevDepth; i++) {
        html += '<ul class="list-disc pl-5 space-y-1">';
      }
    } else if (depth < prevDepth) {
      for (let i = 0; i < prevDepth - depth; i++) {
        html += '</ul>';
      }
    }

    html += `<li>${content}</li>`;
    prevDepth = depth;
  });

  // 남은 ul 닫기
  for (let i = 0; i <= prevDepth; i++) {
    html += '</ul>';
  }

  return html;
}
