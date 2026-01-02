'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getRecords,
  getRecordStats,
  type SealRecord,
  type RecordQueryParams,
  type RecordStats,
  SEAL_TYPES,
  getSealTypeLabel,
} from '@/lib/record-api';

/**
 * 签章记录页面
 * 展示签章操作历史记录，支持筛选和分页
 */
export default function RecordsPage() {
  // 签章记录列表
  const [records, setRecords] = useState<SealRecord[]>([]);
  // 统计数据
  const [stats, setStats] = useState<RecordStats | null>(null);
  // 加载状态
  const [loading, setLoading] = useState(true);
  // 错误信息
  const [error, setError] = useState<string | null>(null);
  // 查询参数
  const [filters, setFilters] = useState<RecordQueryParams>({
    page: 1,
    size: 10,
  });
  // 分页信息
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  /**
   * 加载签章记录列表
   */
  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRecords(filters);
      if (response.code === 200 && response.data) {
        setRecords(response.data.content || []);
        setPagination({
          total: response.data.totalElements || 0,
          totalPages: response.data.totalPages || 0,
        });
      } else {
        setError(response.message || '加载签章记录失败');
      }
    } catch (err) {
      console.error('加载签章记录失败:', err);
      setError('加载签章记录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * 加载统计数据
   */
  const loadStats = useCallback(async () => {
    try {
      const response = await getRecordStats();
      if (response.code === 200 && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('加载统计数据失败:', err);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    loadRecords();
    loadStats();
  }, [loadRecords, loadStats]);

  /**
   * 处理页码变化
   */
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  /**
   * 处理类型筛选
   */
  const handleTypeFilter = (type: number | undefined) => {
    setFilters(prev => ({ ...prev, sealType: type, page: 1 }));
  };

  /**
   * 格式化日期时间
   */
  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">签章记录</h1>
          <p className="text-gray-500 mt-1">查看所有签章操作的历史记录</p>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.totalRecords}</div>
              <div className="text-sm text-gray-500">总签章次数</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.normalSeals}</div>
              <div className="text-sm text-gray-500">普通章</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.perforationSeals}</div>
              <div className="text-sm text-gray-500">骑缝章</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-2xl font-bold text-green-600">{stats.personalSignatures}</div>
              <div className="text-sm text-gray-500">个人签名</div>
            </div>
          </div>
        )}

        {/* 筛选区域 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* 类型筛选 */}
            <select
              value={filters.sealType ?? ''}
              onChange={(e) => handleTypeFilter(e.target.value ? Number(e.target.value) : undefined)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全部类型</option>
              {SEAL_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            {/* 刷新按钮 */}
            <button
              onClick={() => { loadRecords(); loadStats(); }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              刷新
            </button>
          </div>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-500">加载中...</span>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadRecords}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              重试
            </button>
          </div>
        )}

        {/* 签章记录列表 */}
        {!loading && !error && (
          <>
            {records.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <p className="text-gray-500">暂无签章记录</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        签章类型
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        合同ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        页码
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        位置
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作人
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        签章时间
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.map((record) => {
                      const typeInfo = getSealTypeLabel(record.sealType);
                      return (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            #{record.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                typeInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                typeInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                                typeInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {record.sealTypeText || typeInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <a
                              href={`/contracts/${record.contractId}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              #{record.contractId}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            第 {record.pageNumber} 页
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ({Math.round(record.positionX)}, {Math.round(record.positionY)})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.operatorName || `用户 #${record.operatorId}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(record.sealTime)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* 分页 */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange((filters.page || 1) - 1)}
                  disabled={(filters.page || 1) <= 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  上一页
                </button>
                <span className="text-gray-600">
                  第 {filters.page || 1} / {pagination.totalPages} 页，共 {pagination.total} 条
                </span>
                <button
                  onClick={() => handlePageChange((filters.page || 1) + 1)}
                  disabled={(filters.page || 1) >= pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
