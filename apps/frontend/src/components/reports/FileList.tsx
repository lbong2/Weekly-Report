'use client';

import { ReportFile } from '@/types';
import { filesApi } from '@/lib/api/files';

interface FileListProps {
  files: ReportFile[];
  onDelete?: (fileId: string) => void;
}

// 파일 크기 포맷
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// 파일 타입에 따른 아이콘
function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '🗜️';
  if (mimeType.includes('text')) return '📃';
  return '📎';
}

// 날짜 포맷
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function FileList({ files, onDelete }: FileListProps) {
  const handleDownload = (file: ReportFile) => {
    const url = filesApi.getDownloadUrl(file.id);
    window.open(url, '_blank');
  };

  const handleDelete = async (file: ReportFile) => {
    if (!confirm(`"${file.originalName}" 파일을 삭제하시겠습니까?`)) return;

    try {
      await filesApi.delete(file.id);
      onDelete?.(file.id);
    } catch (err: any) {
      alert(err.message || '파일 삭제에 실패했습니다.');
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <p className="mt-2">등록된 파일이 없습니다.</p>
        <p className="text-sm mt-1">위 영역에 파일을 드래그하거나 클릭하여 업로드하세요.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              파일명
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              크기
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              업로더
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              업로드일
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              작업
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.map((file) => (
            <tr key={file.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <span className="text-xl mr-2">{getFileIcon(file.mimeType)}</span>
                  <div>
                    <button
                      onClick={() => handleDownload(file)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                    >
                      {file.originalName}
                    </button>
                    {file.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{file.description}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {formatFileSize(file.size)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {file.uploader.name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {formatDate(file.createdAt)}
              </td>
              <td className="px-4 py-3 text-right text-sm">
                <button
                  onClick={() => handleDownload(file)}
                  className="text-blue-600 hover:text-blue-800 mr-3"
                  title="다운로드"
                >
                  <svg className="w-5 h-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(file)}
                  className="text-red-600 hover:text-red-800"
                  title="삭제"
                >
                  <svg className="w-5 h-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
