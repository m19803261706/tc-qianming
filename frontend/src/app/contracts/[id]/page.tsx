'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PdfViewer } from '@/components/contract';
import SealRecordTimeline from '@/components/contract/SealRecordTimeline';
import {
  getContractById,
  type Contract,
  CONTRACT_STATUS,
} from '@/lib/contract-api';
import { API_BASE_URL } from '@/lib/api';

/**
 * 合同详情页面
 *
 * 功能：
 * - 合同基本信息展示
 * - PDF 预览
 * - 签章记录时间线
 * - 文件下载
 */
export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = Number(params.id);

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'records'>('preview');

  // 加载合同详情
  const loadContract = useCallback(async () => {
    if (!contractId || isNaN(contractId)) {
      setError('无效的合同ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getContractById(contractId);
      if (response.success && response.data) {
        setContract(response.data);
      } else {
        setError(response.message || '加载合同失败');
      }
    } catch (err) {
      console.error('加载合同详情失败:', err);
      setError('加载合同详情失败');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    loadContract();
  }, [loadContract]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gray-500">加载中...</span>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="mt-4 text-gray-500">{error || '合同不存在'}</p>
          <button
            onClick={() => router.push('/contracts')}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            返回合同列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 页面头部 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* 面包屑 */}
          <nav className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/contracts" className="hover:text-gray-700">
              合同管理
            </Link>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900">合同详情</span>
          </nav>

          {/* 标题和操作 */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-14 w-14 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{contract.contractName}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(contract.status)}`}>
                    {getStatusLabel(contract.status)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {contract.pageCount} 页 · {contract.fileSizeReadable || formatFileSize(contract.fileSize)}
                  </span>
                </div>
                {contract.remark && (
                  <p className="text-sm text-gray-500 mt-1">{contract.remark}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {/* 签章按钮 */}
              {contract.status !== 3 && (
                <Link
                  href={`/contracts/${contract.id}/seal`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  签章
                </Link>
              )}
              {/* 下载按钮 - 优先下载签章版 */}
              <a
                href={`${API_BASE_URL}/api/contracts/${contract.id}/download?type=signed`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {contract.signedUrl ? '下载签章版' : '下载'}
              </a>
              {/* 如果有签章版，额外提供下载原件的选项 */}
              {contract.signedUrl && (
                <a
                  href={`${API_BASE_URL}/api/contracts/${contract.id}/download?type=original`}
                  className="inline-flex items-center px-4 py-2 border border-gray-200 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  title="下载原始PDF文件（未签章）"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  原件
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：信息和时间线 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 基本信息卡片 */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">合同信息</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">文件名</dt>
                  <dd className="text-gray-900 text-right truncate max-w-[200px]" title={contract.fileName}>
                    {contract.fileName}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">创建时间</dt>
                  <dd className="text-gray-900">{formatTime(contract.createTime)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">更新时间</dt>
                  <dd className="text-gray-900">{formatTime(contract.updateTime)}</dd>
                </div>
              </dl>
            </div>

            {/* Tab 切换 */}
            <div className="bg-white rounded-lg shadow">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'preview'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  预览
                </button>
                <button
                  onClick={() => setActiveTab('records')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === 'records'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  签章记录
                </button>
              </div>

              <div className="p-4">
                {activeTab === 'records' && (
                  <SealRecordTimeline contractId={contract.id} />
                )}
                {activeTab === 'preview' && (
                  <div className="text-center text-gray-500 py-8">
                    <p>请在右侧查看 PDF 预览</p>
                    <p className="text-sm mt-1">或切换到【签章记录】查看历史</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：PDF 预览 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h3 className="font-medium text-gray-700">PDF 预览</h3>
              </div>
              <PdfViewer
                contractId={contract.id}
                showPageNumbers
                heightClassName="h-[700px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
