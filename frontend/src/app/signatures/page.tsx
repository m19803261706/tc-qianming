'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  getSignatures,
  deleteSignature,
  setDefaultSignature,
  updateSignatureStatus,
  type Signature,
  type SignatureQueryParams,
  SIGNATURE_TYPES,
  SIGNATURE_STATUS,
} from '@/lib/signature-api';
import { API_BASE_URL } from '@/lib/api';

/**
 * 签名管理页面
 * 展示用户签名列表，支持设置默认签名、启用/禁用、删除等操作
 */
export default function SignaturesPage() {
  // 签名列表数据
  const [signatures, setSignatures] = useState<Signature[]>([]);
  // 加载状态
  const [loading, setLoading] = useState(true);
  // 错误信息
  const [error, setError] = useState<string | null>(null);
  // 搜索关键词（输入框值）
  const [searchKeyword, setSearchKeyword] = useState('');
  // 查询参数
  const [filters, setFilters] = useState<SignatureQueryParams>({
    page: 1,
    size: 12,
  });
  // 分页信息
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });
  // 操作中的签名ID
  const [operatingId, setOperatingId] = useState<number | null>(null);

  // 防抖定时器
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 加载签名列表
   */
  const loadSignatures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSignatures(filters);
      if (response.code === 200 && response.data) {
        setSignatures(response.data.content || []);
        setPagination({
          total: response.data.totalElements || 0,
          totalPages: response.data.totalPages || 0,
        });
      } else {
        setError(response.message || '加载签名列表失败');
      }
    } catch (err) {
      console.error('加载签名列表失败:', err);
      setError('加载签名列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // 加载数据
  useEffect(() => {
    loadSignatures();
  }, [loadSignatures]);

  // 搜索防抖处理
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, keyword: searchKeyword, page: 1 }));
    }, 300);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchKeyword]);

  /**
   * 处理设置默认签名
   */
  const handleSetDefault = async (signature: Signature) => {
    if (signature.isDefault === 1) return;

    try {
      setOperatingId(signature.id);
      const response = await setDefaultSignature(signature.id, signature.userId);
      if (response.code === 200) {
        await loadSignatures();
      } else {
        alert(response.message || '设置默认签名失败');
      }
    } catch (err) {
      console.error('设置默认签名失败:', err);
      alert('设置默认签名失败，请稍后重试');
    } finally {
      setOperatingId(null);
    }
  };

  /**
   * 处理切换签名状态
   */
  const handleToggleStatus = async (signature: Signature) => {
    const newStatus = signature.status === 1 ? 0 : 1;

    try {
      setOperatingId(signature.id);
      const response = await updateSignatureStatus(signature.id, newStatus);
      if (response.code === 200) {
        await loadSignatures();
      } else {
        alert(response.message || '更新签名状态失败');
      }
    } catch (err) {
      console.error('更新签名状态失败:', err);
      alert('更新签名状态失败，请稍后重试');
    } finally {
      setOperatingId(null);
    }
  };

  /**
   * 处理删除签名
   */
  const handleDelete = async (signature: Signature) => {
    if (!confirm(`确定要删除签名"${signature.signatureName}"吗？此操作不可恢复。`)) {
      return;
    }

    try {
      setOperatingId(signature.id);
      const response = await deleteSignature(signature.id);
      if (response.code === 200) {
        await loadSignatures();
      } else {
        alert(response.message || '删除签名失败');
      }
    } catch (err) {
      console.error('删除签名失败:', err);
      alert('删除签名失败，请稍后重试');
    } finally {
      setOperatingId(null);
    }
  };

  /**
   * 获取签名类型标签
   */
  const getTypeLabel = (type: number) => {
    const typeInfo = SIGNATURE_TYPES.find(t => t.value === type);
    return typeInfo || { label: '未知', color: 'gray' };
  };

  /**
   * 获取签名状态标签
   */
  const getStatusLabel = (status: number) => {
    const statusInfo = SIGNATURE_STATUS.find(s => s.value === status);
    return statusInfo || { label: '未知', color: 'gray' };
  };

  /**
   * 获取签名图片URL
   */
  const getImageUrl = (signature: Signature) => {
    if (signature.signatureImageUrl) {
      return signature.signatureImageUrl;
    }
    if (signature.signatureImage) {
      return `${API_BASE_URL}${signature.signatureImage}`;
    }
    return '';
  };

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
    setFilters(prev => ({ ...prev, signatureType: type, page: 1 }));
  };

  /**
   * 处理状态筛选
   */
  const handleStatusFilter = (status: number | undefined) => {
    setFilters(prev => ({ ...prev, status: status, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">签名管理</h1>
          <p className="text-gray-500 mt-1">管理您的电子签名，支持手写签名、字体生成和图片上传</p>
        </div>

        {/* 筛选区域 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* 搜索框 */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="搜索签名名称..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 类型筛选 */}
            <select
              value={filters.signatureType ?? ''}
              onChange={(e) => handleTypeFilter(e.target.value ? Number(e.target.value) : undefined)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全部类型</option>
              {SIGNATURE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            {/* 状态筛选 */}
            <select
              value={filters.status ?? ''}
              onChange={(e) => handleStatusFilter(e.target.value ? Number(e.target.value) : undefined)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全部状态</option>
              {SIGNATURE_STATUS.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            {/* 创建按钮 */}
            <a
              href="/signatures/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              创建签名
            </a>
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
              onClick={loadSignatures}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              重试
            </button>
          </div>
        )}

        {/* 签名列表 */}
        {!loading && !error && (
          <>
            {signatures.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">✍️</div>
                <p className="text-gray-500 mb-4">暂无签名数据</p>
                <a
                  href="/signatures/create"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  创建第一个签名
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {signatures.map((signature) => {
                  const typeInfo = getTypeLabel(signature.signatureType);
                  const statusInfo = getStatusLabel(signature.status);
                  const imageUrl = getImageUrl(signature);
                  const isOperating = operatingId === signature.id;

                  return (
                    <div
                      key={signature.id}
                      className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md ${
                        signature.isDefault === 1 ? 'ring-2 ring-blue-500' : ''
                      } ${isOperating ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {/* 签名图片预览 */}
                      <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={signature.signatureName}
                            className="absolute inset-0 w-full h-full object-contain p-4"
                          />
                        ) : (
                          <span className="text-gray-400">无预览</span>
                        )}
                        {/* 默认标记 */}
                        {signature.isDefault === 1 && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            默认
                          </div>
                        )}
                      </div>

                      {/* 签名信息 */}
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 truncate" title={signature.signatureName}>
                          {signature.signatureName}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          {/* 类型标签 */}
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              typeInfo.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                              typeInfo.color === 'green' ? 'bg-green-100 text-green-700' :
                              typeInfo.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {typeInfo.label}
                          </span>
                          {/* 状态标签 */}
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              statusInfo.color === 'green' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          创建于 {new Date(signature.createTime).toLocaleDateString()}
                        </p>
                      </div>

                      {/* 操作按钮 */}
                      <div className="px-4 pb-4 flex gap-2">
                        {/* 设为默认 */}
                        {signature.isDefault !== 1 && (
                          <button
                            onClick={() => handleSetDefault(signature)}
                            className="flex-1 text-xs py-1.5 border border-blue-500 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                            disabled={isOperating}
                          >
                            设为默认
                          </button>
                        )}
                        {/* 启用/禁用 */}
                        <button
                          onClick={() => handleToggleStatus(signature)}
                          className={`flex-1 text-xs py-1.5 border rounded transition-colors ${
                            signature.status === 1
                              ? 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
                              : 'border-green-500 text-green-600 hover:bg-green-50'
                          }`}
                          disabled={isOperating}
                        >
                          {signature.status === 1 ? '禁用' : '启用'}
                        </button>
                        {/* 删除 */}
                        <button
                          onClick={() => handleDelete(signature)}
                          className="flex-1 text-xs py-1.5 border border-red-500 text-red-600 rounded hover:bg-red-50 transition-colors"
                          disabled={isOperating}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  );
                })}
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
