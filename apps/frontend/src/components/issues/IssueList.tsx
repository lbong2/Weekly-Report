'use client';

import { Issue, Chain, IssueStatus } from '@/types/models';

interface IssueListProps {
    issues: Issue[];
    onEdit: (issue: Issue) => void;
    onDelete: (id: string) => void;
}

const statusMap: Record<IssueStatus, { label: string; color: string; bg: string }> = {
    IN_PROGRESS: { label: '진행중', color: 'text-blue-800', bg: 'bg-blue-100' },
    BACKLOG: { label: '대기', color: 'text-yellow-800', bg: 'bg-yellow-100' },
    DONE: { label: '완료', color: 'text-green-800', bg: 'bg-green-100' },
    HOLD: { label: '보류', color: 'text-gray-800', bg: 'bg-gray-100' },
};

export default function IssueList({ issues, onEdit, onDelete }: IssueListProps) {
    if (issues.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-500">등록된 이슈가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">상태</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">모듈</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80 whitespace-nowrap">제목</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48 whitespace-nowrap">기간</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">진척률</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-52 whitespace-nowrap">담당자</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-28 whitespace-nowrap">관리</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {issues.map((issue) => {
                        const status = statusMap[issue.status] || statusMap.IN_PROGRESS;
                        return (
                            <tr key={issue.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                        {status.label}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {issue.chain ? (
                                        <span
                                            className="inline-block px-2 py-1 text-xs font-bold rounded truncate max-w-full"
                                            style={{
                                                backgroundColor: issue.chain.color + '20',
                                                color: issue.chain.color,
                                                border: `1.5px solid ${issue.chain.color}`
                                            }}
                                            title={issue.chain.name}
                                        >
                                            {issue.chain.name}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                    <div className="truncate max-w-xs" title={issue.title}>
                                        {issue.title}
                                    </div>
                                    {issue.purpose && (
                                        <p className="text-xs text-gray-500 mt-1 truncate max-w-xs" title={issue.purpose}>
                                            {issue.purpose}
                                        </p>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {issue.startDate ? new Date(issue.startDate).toLocaleDateString() : '미정'} ~{' '}
                                    {issue.endDate ? new Date(issue.endDate).toLocaleDateString() : '미정'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-1 w-20 bg-gray-200 rounded-full h-2 mr-2">
                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${issue.progress}%` }}></div>
                                        </div>
                                        <span className="text-xs text-gray-600">{issue.progress}%</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {issue.completedCount} / {issue.totalCount}
                                    </div>
                                </td>
                                <td className="px-3 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {issue.assignees && issue.assignees.length > 0 ? (
                                            issue.assignees.map((assignee) => (
                                                <span
                                                    key={assignee.id}
                                                    className={`inline-block px-1.5 py-0.5 text-xs rounded font-semibold whitespace-nowrap ${assignee.user.position === 'TEAM_LEAD'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : assignee.user.position === 'MANAGER'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                >
                                                    {assignee.user.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-400">-</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onEdit(issue)} className="text-blue-600 hover:text-blue-900 mr-4">수정</button>
                                    <button onClick={() => onDelete(issue.id)} className="text-red-600 hover:text-red-900">삭제</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
