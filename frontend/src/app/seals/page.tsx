'use client';

import { useState, useEffect, useCallback } from 'react';
import SealCard from '@/components/seal/SealCard';
import SealEditModal from '@/components/seal/SealEditModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  type Seal,
  type SealQueryParams,
  getSeals,
  deleteSeal,
  updateSealStatus,
  SEAL_TYPES,
  SEAL_STATUS,
} from '@/lib/seal-api';

/**
 * 印章管理页面
 */
export default function SealManagePage() {
  // 状态管理
  const [seals, setSeals] = useState<Seal[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // 筛选条件
  const [filters, setFilters] = useState<SealQueryParams>({
    page: 1,
    size: 12,
    sealType: undefined,
    status: undefined,
  });

  // 弹窗状态
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSeal, setEditingSeal] = useState<Seal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSeal, setDeletingSeal] = useState<Seal | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 加载印章列表
  const loadSeals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSeals(filters);
      if (response.success) {
        setSeals(response.data.content);
        setTotal(response.data.totalElements);
      } else {
        console.error('加载失败:', response.message);
      }
    } catch (error) {
      console.error('加载印章列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadSeals();
  }, [loadSeals]);

  // 打开新增弹窗
  const handleAdd = () => {
    setEditingSeal(null);
    setEditModalOpen(true);
  };

  // 打开编辑弹窗
  const handleEdit = (seal: Seal) => {
    setEditingSeal(seal);
    setEditModalOpen(true);
  };

  // 打开删除确认
  const handleDelete = (seal: Seal) => {
    setDeletingSeal(seal);
    setDeleteDialogOpen(true);
  };

  // 确认删除
  const confirmDelete = async () => {
    if (!deletingSeal) return;

    setDeleteLoading(true);
    try {
      const response = await deleteSeal(deletingSeal.id);
      if (response.success) {
        loadSeals();
        setDeleteDialogOpen(false);
        setDeletingSeal(null);
      } else {
        alert(response.message || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    } finally {
      setDeleteLoading(false);
    }
  };

  // 切换状态
  const handleToggleStatus = async (seal: Seal) => {
    const newStatus = seal.status === 1 ? 0 : 1;
    try {
      const response = await updateSealStatus(seal.id, newStatus);
      if (response.success) {
        loadSeals();
      } else {
        alert(response.message || '状态更新失败');
      }
    } catch (error) {
      console.error('状态更新失败:', error);
      alert('状态更新失败，请重试');
    }
  };

  // 筛选变化
  const handleFilterChange = (key: keyof SealQueryParams, value: number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 页面头部 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">印章管理</h1>
              <p className="text-sm text-gray-500 mt-1">
                共 {total} 个印章
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新增印章
            </button>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            {/* 印章类型筛选 */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">类型:</label>
              <select
                value={filters.sealType || ''}
                onChange={(e) => handleFilterChange('sealType', e.target.value ? Number(e.target.value) : undefined)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">全部类型</option>
                {SEAL_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* 状态筛选 */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">状态:</label>
              <select
                value={filters.status ?? ''}
                onChange={(e) => handleFilterChange('status', e.target.value ? Number(e.target.value) : undefined)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">全部状态</option>
                {SEAL_STATUS.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            {/* 刷新按钮 */}
            <button
              onClick={loadSeals}
              disabled={loading}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 印章列表 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : seals.length === 0 ? (
          <div className="text-center py-20">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-gray-500">暂无印章数据</p>
            <button
              onClick={handleAdd}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              创建第一个印章
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {seals.map(seal => (
              <SealCard
                key={seal.id}
                seal={seal}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}

        {/* 分页（简化版） */}
        {!loading && seals.length > 0 && total > filters.size! && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
              disabled={filters.page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              第 {filters.page} / {Math.ceil(total / filters.size!)} 页
            </span>
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
              disabled={filters.page! >= Math.ceil(total / filters.size!)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        )}
      </div>

      {/* 编辑弹窗 */}
      <SealEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={loadSeals}
        seal={editingSeal}
      />

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="确认删除"
        message={`确定要删除印章「${deletingSeal?.sealName}」吗？此操作不可恢复。`}
        confirmText="删除"
        danger
        loading={deleteLoading}
      />
    </div>
  );
}
