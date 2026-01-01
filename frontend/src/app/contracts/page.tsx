'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ContractUploadModal from '@/components/contract/ContractUploadModal';
import {
  type Contract,
  type ContractQueryParams,
  getContracts,
  deleteContract,
  CONTRACT_STATUS,
} from '@/lib/contract-api';
import { API_BASE_URL } from '@/lib/api';

/**
 * 合同管理页面
 *
 * 功能：
 * - 合同列表展示
 * - 状态筛选
 * - 上传新合同
 * - 进入签章流程
 * - 查看签章记录
 */
export default function ContractsPage() {
  // 状态管理
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // 筛选条件
  const [filters, setFilters] = useState<ContractQueryParams>({
    page: 1,
    size: 10,
    status: undefined,
    keyword: '',
  });

  // 弹窗状态
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingContract, setDeletingContract] = useState<Contract | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 加载合同列表
  const loadContracts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (!params.keyword) delete params.keyword;
      if (params.status === undefined) delete params.status;

      const response = await getContracts(params);
      if (response.success && response.data) {
        setContracts(response.data.content);
        setTotal(response.data.totalElements);
      } else {
        console.error('加载失败:', response.message);
      }
    } catch (error) {
      console.error('加载合同列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  // 打开删除确认
  const handleDelete = (contract: Contract) => {
    setDeletingContract(contract);
    setDeleteDialogOpen(true);
  };

  // 确认删除
  const confirmDelete = async () => {
    if (!deletingContract) return;

    setDeleteLoading(true);
    try {
      const response = await deleteContract(deletingContract.id);
      if (response.success) {
        loadContracts();
        setDeleteDialogOpen(false);
        setDeletingContract(null);
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

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化时间
  const formatTime = (timeStr: string): string => {
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 获取状态样式
  const getStatusStyle = (status: number) => {
    const statusInfo = CONTRACT_STATUS.find(s => s.value === status);
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-600',
      yellow: 'bg-yellow-100 text-yellow-700',
      green: 'bg-green-100 text-green-700',
      blue: 'bg-blue-100 text-blue-700',
    };
    return colorMap[statusInfo?.color || 'gray'] || colorMap.gray;
  };

  // 获取状态标签
  const getStatusLabel = (status: number) => {
    return CONTRACT_STATUS.find(s => s.value === status)?.label || '未知';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 页面头部 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">合同管理</h1>
              <p className="text-sm text-gray-500 mt-1">
                共 {total} 份合同
              </p>
            </div>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              上传合同
            </button>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            {/* 关键词搜索 */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="搜索合同名称..."
                value={filters.keyword || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value, page: 1 }))}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 状态筛选 */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">状态:</label>
              <select
                value={filters.status ?? ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  status: e.target.value ? Number(e.target.value) : undefined,
                  page: 1
                }))}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">全部状态</option>
                {CONTRACT_STATUS.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            {/* 刷新按钮 */}
            <button
              onClick={loadContracts}
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

      {/* 合同列表 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-gray-500">暂无合同</p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              上传第一份合同
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    合同名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    页数/大小
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={contract.contractName}>
                            {contract.contractName}
                          </div>
                          {contract.fileName !== contract.contractName && (
                            <div className="text-xs text-gray-400 truncate max-w-xs" title={contract.fileName}>
                              原文件: {contract.fileName}
                            </div>
                          )}
                          {contract.remark && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {contract.remark}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contract.pageCount} 页</div>
                      <div className="text-xs text-gray-500">{contract.fileSizeReadable || formatFileSize(contract.fileSize)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(contract.status)}`}>
                        {getStatusLabel(contract.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(contract.createTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {/* 签章按钮 */}
                        {contract.status !== 3 && (
                          <Link
                            href={`/contracts/${contract.id}/seal`}
                            className="text-blue-600 hover:text-blue-900"
                            title="签章"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </Link>
                        )}
                        {/* 详情/记录按钮 */}
                        <Link
                          href={`/contracts/${contract.id}`}
                          className="text-gray-600 hover:text-gray-900"
                          title="查看详情"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        {/* 下载按钮 */}
                        <a
                          href={`${API_BASE_URL}/api/contracts/${contract.id}/download?type=signed`}
                          className="text-green-600 hover:text-green-900"
                          title={contract.signedUrl ? '下载签章版' : '下载'}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                        {/* 如果已签章，提供下载原件的选项 */}
                        {contract.signedUrl && (
                          <a
                            href={`${API_BASE_URL}/api/contracts/${contract.id}/download?type=original`}
                            className="text-gray-400 hover:text-gray-600"
                            title="下载原件"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </a>
                        )}
                        {/* 删除按钮 */}
                        <button
                          onClick={() => handleDelete(contract)}
                          className="text-red-600 hover:text-red-900"
                          title="删除"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 分页 */}
            {total > filters.size! && (
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  共 {total} 条，第 {filters.page} / {Math.ceil(total / filters.size!)} 页
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                    disabled={filters.page === 1}
                    className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                    disabled={filters.page! >= Math.ceil(total / filters.size!)}
                    className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 上传弹窗 */}
      <ContractUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={loadContracts}
      />

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="确认删除"
        message={`确定要删除合同「${deletingContract?.contractName}」吗？此操作不可恢复。`}
        confirmText="删除"
        danger
        loading={deleteLoading}
      />
    </div>
  );
}
