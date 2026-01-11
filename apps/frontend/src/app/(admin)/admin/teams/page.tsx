'use client';

import { useState, useEffect } from 'react';
import { teamsApi } from '@/lib/api/teams';
import { Team } from '@/types/models';
import { CreateTeamRequest, UpdateTeamRequest } from '@/types/api';
import { TeamFormModal } from '@/components/admin/TeamFormModal';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const teamsData = await teamsApi.getList();
      setTeams(teamsData);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 팀 추가
  const handleCreate = () => {
    setEditingTeam(null);
    setIsModalOpen(true);
  };

  // 팀 수정
  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setIsModalOpen(true);
  };

  // 팀 삭제
  const handleDelete = async (team: Team) => {
    if (!confirm(`${team.name} 팀을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await teamsApi.delete(team.id);
      alert('팀이 삭제되었습니다.');
      loadData();
    } catch (err: any) {
      console.error('삭제 실패:', err);
      alert(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  // 팀 저장 (추가/수정)
  const handleSubmit = async (data: CreateTeamRequest | UpdateTeamRequest) => {
    try {
      if (editingTeam) {
        await teamsApi.update(editingTeam.id, data as UpdateTeamRequest);
        alert('팀이 수정되었습니다.');
      } else {
        await teamsApi.create(data as CreateTeamRequest);
        alert('팀이 추가되었습니다.');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      throw err; // TeamFormModal에서 처리
    }
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
          <h1 className="text-2xl font-bold text-gray-900">팀 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            총 {teams.length}개의 팀
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + 팀 추가
        </button>
      </div>

      {/* 팀 목록 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                팀명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                위치
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                총 인원
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teams.map((team) => (
              <tr key={team.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {team.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{team.location || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{team.totalMembers}명</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(team)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(team)}
                    className="text-red-600 hover:text-red-900"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {teams.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            등록된 팀이 없습니다.
          </div>
        )}
      </div>

      {/* 팀 추가/수정 모달 */}
      <TeamFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTeam(null);
        }}
        onSubmit={handleSubmit}
        editTeam={editingTeam}
      />
    </div>
  );
}
