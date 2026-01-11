'use client';

import { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onFinishIssue?: (issueId: string) => void;
  onPromoteIssue?: (task: Task) => void;
}

/**
 * 업무 목록 컴포넌트
 */
export function TaskList({ tasks, onEdit, onDelete, onFinishIssue, onPromoteIssue }: TaskListProps) {
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
                  task.assignees.map((assignee) => (
                    <span
                      key={assignee.id}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {assignee.user.name}
                    </span>
                  ))
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
        </div>
      ))}
    </div>
  );
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
