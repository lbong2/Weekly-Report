'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { startOfISOWeek, endOfISOWeek, setISOWeek, setYear, format, getISOWeek, addDays } from 'date-fns';

// 폼 스키마
const createReportSchema = z.object({
  year: z.number().min(2020).max(2100),
  weekNumber: z.number().min(1).max(53),
  weekStart: z.string().min(1, '시작일을 입력하세요'),
  weekEnd: z.string().min(1, '종료일을 입력하세요'),
});

type CreateReportFormData = z.infer<typeof createReportSchema>;

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateReportFormData) => Promise<void>;
  teamId: string;
}

export default function CreateReportModal({
  isOpen,
  onClose,
  onSubmit,
  teamId,
}: CreateReportModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateReportFormData>({
    resolver: zodResolver(createReportSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      weekNumber: getISOWeek(new Date()),
      weekStart: '',
      weekEnd: '',
    },
  });

  // 연도와 주차 watch
  const watchYear = watch('year');
  const watchWeekNumber = watch('weekNumber');

  // 연도나 주차가 변경되면 시작일/종료일 자동 계산
  useEffect(() => {
    if (watchYear && watchWeekNumber) {
      try {
        // 해당 연도의 날짜 생성 (1월 4일 기준이 ISO 주차 계산에 안전함)
        const date = new Date(watchYear, 0, 4);
        // 해당 주차 설정
        const weekDate = setISOWeek(date, watchWeekNumber);
        const targetDate = setYear(weekDate, watchYear); // 연도 재확인

        // 월요일(시작일)과 금요일(종료일) 계산
        const startDate = startOfISOWeek(targetDate);
        const endDate = addDays(startDate, 4); // 월요일 + 4일 = 금요일

        // 값 설정
        setValue('weekStart', format(startDate, 'yyyy-MM-dd'));
        setValue('weekEnd', format(endDate, 'yyyy-MM-dd'));
      } catch (e) {
        console.error('Date calculation error:', e);
      }
    }
  }, [watchYear, watchWeekNumber, setValue]);

  const handleFormSubmit = async (data: CreateReportFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (err: any) {
      setError(err.message || '주간보고서 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />

      {/* 모달 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            새 주간보고서 작성
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            주간보고서 기본 정보를 입력하세요
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* 연도 */}
          <div>
            <label
              htmlFor="year"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              연도
            </label>
            <input
              id="year"
              type="number"
              {...register('year', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
            {errors.year && (
              <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
            )}
          </div>

          {/* 주차 */}
          <div>
            <label
              htmlFor="weekNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              주차
            </label>
            <input
              id="weekNumber"
              type="number"
              {...register('weekNumber', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
            {errors.weekNumber && (
              <p className="mt-1 text-sm text-red-600">
                {errors.weekNumber.message}
              </p>
            )}
          </div>

          {/* 시작일 */}
          <div>
            <label
              htmlFor="weekStart"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              시작일 (월)
            </label>
            <input
              id="weekStart"
              type="date"
              {...register('weekStart')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 text-gray-600 cursor-not-allowed"
              readOnly
              tabIndex={-1}
            />
            {errors.weekStart && (
              <p className="mt-1 text-sm text-red-600">
                {errors.weekStart.message}
              </p>
            )}
          </div>

          {/* 종료일 */}
          <div>
            <label
              htmlFor="weekEnd"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              종료일 (금)
            </label>
            <input
              id="weekEnd"
              type="date"
              {...register('weekEnd')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 text-gray-600 cursor-not-allowed"
              readOnly
              tabIndex={-1}
            />
            {errors.weekEnd && (
              <p className="mt-1 text-sm text-red-600">
                {errors.weekEnd.message}
              </p>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '생성 중...' : '생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
