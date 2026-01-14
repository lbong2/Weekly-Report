'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usersApi } from '@/lib/api/users';
import { teamsApi } from '@/lib/api/teams';
import { User, Team, Role, Position } from '@/types/models';
import { CreateUserRequest, UpdateUserRequest } from '@/types/api';
import { UserFormModal } from '@/components/admin/UserFormModal';
import { useAuth } from '@/lib/hooks/useAuth';

// 드래그 가능한 행 컴포넌트
function SortableRow({
  user,
  currentUserId,
  onEdit,
  onDelete,
  getPositionLabel,
  getRoleLabel,
}: {
  user: User;
  currentUserId?: string;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  getPositionLabel: (position: Position) => string;
  getRoleLabel: (role: Role) => string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: user.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50 ${isDragging ? 'bg-gray-100' : ''}`}
    >
      {/* 드래그 핸들 */}
      <td className="px-4 py-4 whitespace-nowrap">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <circle cx="7" cy="5" r="1.5" />
            <circle cx="13" cy="5" r="1.5" />
            <circle cx="7" cy="10" r="1.5" />
            <circle cx="13" cy="10" r="1.5" />
            <circle cx="7" cy="15" r="1.5" />
            <circle cx="13" cy="15" r="1.5" />
          </svg>
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {user.name}
          {user.id === currentUserId && (
            <span className="ml-2 text-xs text-blue-600">(본인)</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{user.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.team?.name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.position === 'TEAM_LEAD'
              ? 'bg-purple-100 text-purple-800'
              : user.position === 'MANAGER'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
        >
          {getPositionLabel(user.position)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-gray-100 text-gray-800'
            }`}
        >
          {getRoleLabel(user.role)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.displayOrder}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onEdit(user)}
          className="text-blue-600 hover:text-blue-900 mr-4"
        >
          수정
        </button>
        <button
          onClick={() => onDelete(user)}
          className="text-red-600 hover:text-red-900"
          disabled={user.id === currentUserId}
        >
          삭제
        </button>
      </td>
    </tr>
  );
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, teamsData] = await Promise.all([
        usersApi.getList(),
        teamsApi.getList(),
      ]);
      const sortedUsers = usersData.sort((a, b) => a.displayOrder - b.displayOrder);
      setUsers(sortedUsers);
      setTeams(teamsData);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = users.findIndex((u) => u.id === active.id);
      const newIndex = users.findIndex((u) => u.id === over.id);

      // 배열 재정렬
      const newUsers = arrayMove(users, oldIndex, newIndex);

      // UI 즉시 업데이트 (낙관적 업데이트)
      setUsers(newUsers);

      try {
        // displayOrder 재계산 및 백엔드 업데이트
        await Promise.all(
          newUsers.map((user, index) =>
            usersApi.update(user.id, {
              displayOrder: index + 1,
            })
          )
        );

        // 성공 시 서버에서 최신 데이터 다시 조회
        await loadData();
      } catch (err) {
        console.error('순서 업데이트 실패:', err);
        alert('순서 변경에 실패했습니다.');
        // 실패 시 다시 로드
        await loadData();
      }
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (user: User) => {
    // 본인 삭제 방지
    if (user.id === currentUser?.id) {
      alert('본인 계정은 삭제할 수 없습니다.');
      return;
    }

    if (!confirm(`${user.name} (${user.email}) 사용자를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await usersApi.delete(user.id);
      alert('사용자가 삭제되었습니다.');
      loadData();
    } catch (err: any) {
      console.error('삭제 실패:', err);
      alert(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async (data: CreateUserRequest | UpdateUserRequest) => {
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, data as UpdateUserRequest);
        alert('사용자가 수정되었습니다.');
      } else {
        await usersApi.create(data as CreateUserRequest);
        alert('사용자가 추가되었습니다.');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      throw err; // UserFormModal에서 처리
    }
  };

  // 직책 한글 변환
  const getPositionLabel = (position: Position): string => {
    const labels: Record<Position, string> = {
      STAFF: '사원',
      MANAGER: '매니저',
      TEAM_LEAD: '팀장',
    };
    return labels[position] || position;
  };

  // 권한 한글 변환
  const getRoleLabel = (role: Role): string => {
    return role === 'ADMIN' ? '관리자' : '일반';
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
          <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            총 {users.length}명의 사용자 (드래그하여 순서 변경)
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + 사용자 추가
        </button>
      </div>

      {/* 사용자 목록 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  순서
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이메일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  팀
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  직책
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  권한
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  정렬 순서
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <SortableContext
                items={users.map((u) => u.id)}
                strategy={verticalListSortingStrategy}
              >
                {users.map((user) => (
                  <SortableRow
                    key={user.id}
                    user={user}
                    currentUserId={currentUser?.id}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    getPositionLabel={getPositionLabel}
                    getRoleLabel={getRoleLabel}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              등록된 사용자가 없습니다.
            </div>
          )}
        </DndContext>
      </div>

      {/* 사용자 추가/수정 모달 */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleSubmit}
        editUser={editingUser}
        teams={teams}
      />
    </div>
  );
}
