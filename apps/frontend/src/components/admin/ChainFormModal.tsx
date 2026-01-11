'use client';

import { useState, useEffect } from 'react';
import { Chain } from '@/types/models';
import { CreateChainRequest, UpdateChainRequest } from '@/types/api';

// 색상 휠에서 균등하게 분포된 대비 색상 생성
const generateDistinctColors = (count: number): string[] => {
  const colors: string[] = [];
  const hueStep = 360 / count;

  for (let i = 0; i < count; i++) {
    const hue = (i * hueStep) % 360;
    // 채도 80%, 명도 40%로 진하고 선명하며 대비가 좋은 색상 생성
    const color = hslToHex(hue, 80, 40);
    colors.push(color);
  }

  return colors;
};

// HSL을 HEX로 변환
const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

interface ChainFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateChainRequest | UpdateChainRequest) => Promise<void>;
  editChain: Chain | null;
  existingChains: Chain[];
}

export function ChainFormModal({
  isOpen,
  onClose,
  onSubmit,
  editChain,
  existingChains,
}: ChainFormModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    color: '#3B82F6',
    displayOrder: 0,
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 사용 중인 색상을 피해 새로운 색상 자동 선정
  const handleAutoColor = () => {
    const existingColors = existingChains
      .filter(c => !editChain || c.id !== editChain.id) // 현재 수정 중인 모듈은 제외
      .map(c => c.color.toUpperCase());

    const totalCount = existingColors.length + 1; // 기존 모듈 + 새 모듈
    const suggestedColors = generateDistinctColors(totalCount);

    // 기존에 사용되지 않은 색상 찾기
    const newColor = suggestedColors.find(color =>
      !existingColors.includes(color.toUpperCase())
    ) || suggestedColors[suggestedColors.length - 1];

    setFormData({ ...formData, color: newColor });
  };

  useEffect(() => {
    if (!isOpen) return;

    if (editChain) {
      setFormData({
        code: editChain.code,
        name: editChain.name,
        color: editChain.color,
        displayOrder: editChain.displayOrder ?? 0,
        isActive: editChain.isActive,
      });
    } else {
      // 신규 생성 시 기존 Chain 개수 + 1을 기본 displayOrder로 설정
      const maxDisplayOrder = existingChains.reduce(
        (max, chain) => Math.max(max, chain.displayOrder ?? 0),
        0
      );
      setFormData({
        code: '',
        name: '',
        color: '#3B82F6',
        displayOrder: maxDisplayOrder + 1,
        isActive: true,
      });
    }
    setError(null);
  }, [isOpen, editChain, existingChains]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      console.error('저장 실패:', err);
      const errorMsg = err.response?.data?.message;
      const displayError = Array.isArray(errorMsg)
        ? errorMsg.join(', ')
        : errorMsg || err.message || '저장에 실패했습니다.';
      setError(displayError);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editChain ? '모듈 수정' : '모듈 추가'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* 코드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  코드 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="D_MEGA_BEAM"
                />
              </div>

              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="D-Mega Beam"
                />
              </div>

              {/* 색상 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    색상 <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoColor}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    자동 선정
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    required
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#3B82F6"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                  <div
                    className="h-10 w-20 rounded border border-gray-300"
                    style={{ backgroundColor: formData.color }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  다른 모듈과 구분되는 색상을 자동으로 선택하려면 &quot;자동 선정&quot;을 클릭하세요
                </p>
              </div>

              {/* 정렬 순서 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  정렬 순서
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  작은 숫자가 먼저 표시됩니다
                </p>
              </div>

              {/* 활성화 여부 */}
              <div className="flex items-center">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  활성
                </label>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={isLoading}
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                disabled={isLoading}
              >
                {isLoading ? '저장 중...' : editChain ? '수정' : '추가'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
