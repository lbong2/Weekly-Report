'use client';

import { useState, useEffect } from 'react';
import { chainsApi } from '@/lib/api/chains';
import { Chain } from '@/types/models';
import { CreateChainRequest, UpdateChainRequest } from '@/types/api';
import { ChainFormModal } from '@/components/admin/ChainFormModal';

export default function ChainsPage() {
  const [chains, setChains] = useState<Chain[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChain, setEditingChain] = useState<Chain | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const chainsData = await chainsApi.getList({ isActive: undefined });
      setChains(chainsData);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingChain(null);
    setIsModalOpen(true);
  };

  const handleEdit = (chain: Chain) => {
    setEditingChain(chain);
    setIsModalOpen(true);
  };

  const handleDelete = async (chain: Chain) => {
    if (!confirm(`'${chain.name}' 모듈을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await chainsApi.delete(chain.id);
      alert('모듈이 삭제되었습니다.');
      loadData();
    } catch (err: any) {
      console.error('삭제 실패:', err);
      alert(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async (data: CreateChainRequest | UpdateChainRequest) => {
    try {
      if (editingChain) {
        await chainsApi.update(editingChain.id, data as UpdateChainRequest);
        alert('모듈이 수정되었습니다.');
      } else {
        await chainsApi.create(data as CreateChainRequest);
        alert('모듈이 추가되었습니다.');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      throw err;
    }
  };

  const handleAutoAssignColors = async () => {
    if (chains.length === 0) {
      alert('등록된 모듈이 없습니다.');
      return;
    }

    if (!confirm(`${chains.length}개 모듈에 자동으로 색상을 부여하시겠습니까?`)) {
      return;
    }

    try {
      setLoading(true);
      const colors = generateDistinctColors(chains.length);

      await Promise.all(
        chains.map((chain, index) =>
          chainsApi.update(chain.id, {
            code: chain.code,
            name: chain.name,
            color: colors[index],
            isActive: chain.isActive,
          })
        )
      );

      alert('모든 모듈에 색상이 자동으로 부여되었습니다.');
      loadData();
    } catch (err: any) {
      console.error('색상 자동 부여 실패:', err);
      alert('색상 자동 부여에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const generateDistinctColors = (count: number): string[] => {
    const colors: string[] = [];
    const hueStep = 360 / count;

    for (let i = 0; i < count; i++) {
      const hue = (i * hueStep) % 360;
      const color = hslToHex(hue, 80, 40);
      colors.push(color);
    }

    return colors;
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">모듈 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            총 {chains.length}개의 모듈
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAutoAssignColors}
            disabled={chains.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            🎨 전체 색상 자동 부여
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + 모듈 추가
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                코드
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {chains.map((chain) => (
              <tr key={chain.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{chain.code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-1 text-xs font-bold rounded"
                      style={{
                        backgroundColor: chain.color + '20',
                        color: chain.color,
                        border: `1.5px solid ${chain.color}`,
                      }}
                    >
                      {chain.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {chain.isActive ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      활성
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      비활성
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(chain)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(chain)}
                    className="text-red-600 hover:text-red-900"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {chains.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            등록된 모듈이 없습니다.
          </div>
        )}
      </div>

      <ChainFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingChain(null);
        }}
        onSubmit={handleSubmit}
        editChain={editingChain}
        existingChains={chains}
      />
    </div>
  );
}
