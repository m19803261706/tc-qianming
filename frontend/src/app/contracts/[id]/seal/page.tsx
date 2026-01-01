'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PdfSealEditor } from '@/components/contract';
import {
  getContractById,
  type Contract,
  CONTRACT_STATUS,
} from '@/lib/contract-api';

/**
 * 合同签章页面
 *
 * 功能：
 * - 完整的签章编辑器
 * - PDF 预览
 * - 印章选择
 * - 位置选择
 * - 签章执行
 */
export default function ContractSealPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = Number(params.id);

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sealSuccess, setSealSuccess] = useState(false);

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
        // 检查合同状态
        if (response.data.status === 3) {
          setError('该合同已归档，无法进行签章操作');
        } else {
          setContract(response.data);
        }
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

  // 签章完成回调
  const handleSealComplete = (result: { success: boolean; message: string }) => {
    if (result.success) {
      setSealSuccess(true);
      // 刷新合同信息
      loadContract();
    } else {
      alert(result.message);
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* 面包屑 */}
          <nav className="flex items-center text-sm text-gray-500 mb-3">
            <Link href="/contracts" className="hover:text-gray-700">
              合同管理
            </Link>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href={`/contracts/${contract.id}`} className="hover:text-gray-700">
              {contract.originalName}
            </Link>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900">签章</span>
          </nav>

          {/* 标题和状态 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-gray-900">合同签章</h1>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(contract.status)}`}>
                {getStatusLabel(contract.status)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{contract.originalName}</span>
              <span>·</span>
              <span>{contract.totalPages} 页</span>
            </div>
          </div>
        </div>
      </div>

      {/* 成功提示 */}
      {sealSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-700 font-medium">签章成功！</span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/contracts/${contract.id}`}
                className="text-sm text-green-700 hover:text-green-800 font-medium"
              >
                查看详情
              </Link>
              <button
                onClick={() => setSealSuccess(false)}
                className="text-sm text-green-700 hover:text-green-800"
              >
                继续签章
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 签章编辑器 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <PdfSealEditor
          contractId={contract.id}
          operatorId={1} // TODO: 从用户上下文获取
          operatorName="管理员" // TODO: 从用户上下文获取
          onSealComplete={handleSealComplete}
          height="h-[calc(100vh-200px)]"
        />
      </div>
    </div>
  );
}
