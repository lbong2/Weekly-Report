'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Issue, Chain, IssueStatus } from '@/types/models';
import { CreateIssueRequest, UpdateIssueRequest } from '@/types/api';

// 폼 스키마
const issueSchema = z.object({
    title: z.string().min(1, '제목을 입력하세요'),
    chainId: z.string().min(1, '모듈을 선택하세요'),
    status: z.enum(['BACKLOG', 'IN_PROGRESS', 'DONE', 'HOLD']),
    purpose: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    totalCount: z.number().min(0).optional(),
    completedCount: z.number().min(0).optional(),
    progress: z.number().min(0).max(100).optional(),
});

type IssueFormData = z.infer<typeof issueSchema>;

interface IssueFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateIssueRequest | UpdateIssueRequest) => Promise<void>;
    initialData?: Issue | null;
    chains: Chain[];
}

export default function IssueFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    chains,
}: IssueFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<IssueFormData>({
        resolver: zodResolver(issueSchema),
        defaultValues: {
            title: '',
            chainId: '',
            status: 'IN_PROGRESS',
            purpose: '',
            startDate: '',
            endDate: '',
            totalCount: 0,
            completedCount: 0,
            progress: 0,
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    title: initialData.title,
                    chainId: initialData.chainId,
                    status: initialData.status,
                    purpose: initialData.purpose || '',
                    startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
                    endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
                    totalCount: initialData.totalCount,
                    completedCount: initialData.completedCount,
                    progress: initialData.progress,
                });
            } else {
                reset({
                    title: '',
                    chainId: chains.length > 0 ? chains[0].id : '',
                    status: 'IN_PROGRESS',
                    purpose: '',
                    startDate: '',
                    endDate: '',
                    totalCount: 0,
                    completedCount: 0,
                    progress: 0,
                });
            }
        }
    }, [isOpen, initialData, chains, reset]);

    const handleFormSubmit = async (data: IssueFormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            await onSubmit(data); // 데이터 변환은 부모 컴포넌트나 여기에서 처리
            // onClose는 부모가 호출하거나 여기서 호출
        } catch (err: any) {
            setError(err.message || '이슈 저장에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {initialData ? '이슈 수정' : '새 이슈 생성'}
                </h2>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                            <input
                                type="text"
                                {...register('title')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">모듈</label>
                            <select
                                {...register('chainId')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">선택하세요</option>
                                {chains.map((chain) => (
                                    <option key={chain.id} value={chain.id}>
                                        {chain.name} ({chain.code})
                                    </option>
                                ))}
                            </select>
                            {errors.chainId && <p className="text-sm text-red-600 mt-1">{errors.chainId.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                        <select
                            {...register('status')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="IN_PROGRESS">진행중 (IN_PROGRESS)</option>
                            <option value="BACKLOG">대기 (BACKLOG)</option>
                            <option value="DONE">완료 (DONE)</option>
                            <option value="HOLD">보류 (HOLD)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">상세 내용 (목적)</label>
                        <textarea
                            {...register('purpose')}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                            <input
                                type="date"
                                {...register('startDate')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                            <input
                                type="date"
                                {...register('endDate')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">총 본수</label>
                            <input
                                type="number"
                                {...register('totalCount', { valueAsNumber: true })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">완료 본수</label>
                            <input
                                type="number"
                                {...register('completedCount', { valueAsNumber: true })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">진척률 (%)</label>
                            <input
                                type="number"
                                {...register('progress', { valueAsNumber: true })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
