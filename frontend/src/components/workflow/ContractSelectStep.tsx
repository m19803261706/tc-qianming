'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getContracts,
  uploadContract,
  type Contract,
  CONTRACT_STATUS,
} from '@/lib/contract-api';

interface ContractSelectStepProps {
  /** 选中的合同 */
  selectedContract: Contract | null;
  /** 选择回调 */
  onSelect: (contract: Contract) => void;
  /** 下一步回调 */
  onNext: () => void;
}

/**
 * 合同选择步骤
 *
 * 功能：
 * - 从列表选择已有合同
 * - 上传新合同
 * - 选中状态高亮
 */
export default function ContractSelectStep({
  selectedContract,
  onSelect,
  onNext,
}: ContractSelectStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载合同列表
  const loadContracts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getContracts({ size: 50, status: 1 }); // 只显示待签章的
      if (response.success && response.data) {
        setContracts(response.data.content);
      }
    } catch (err) {
      console.error('加载合同列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  // 处理文件上传
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // 验证文件类型
    if (file.type !== 'application/pdf') {
      setError('请上传 PDF 格式的文件');
      return;
    }

    // 验证文件大小
    if (file.size > 50 * 1024 * 1024) {
      setError('文件大小不能超过 50MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await uploadContract(file, 1, 1);
      if (response.success && response.data) {
        // 上传成功后自动选中
        onSelect(response.data);
        loadContracts();
      } else {
        setError(response.message || '上传失败');
      }
    } catch (err) {
      console.error('上传失败:', err);
      setError('上传失败，请重试');
    } finally {
      setUploading(false);
      // 重置 input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    return date.toLocaleDateString('zh-CN');
  };

  // 获取状态样式
  const getStatusLabel = (status: number) => {
    return CONTRACT_STATUS.find(s => s.value === status)?.label || '未知';
  };

  return (
    <div className="flex flex-col h-full">
      {/* 标题和操作 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">选择合同</h2>
          <p className="text-sm text-gray-500 mt-1">
            从列表中选择待签章的合同，或上传新合同
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                上传中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                上传合同
              </>
            )}
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 合同列表 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4">暂无待签章合同</p>
            <p className="text-sm mt-1">请上传新合同开始签章流程</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                onClick={() => onSelect(contract)}
                className={`
                  relative p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${selectedContract?.id === contract.id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {/* 选中标记 */}
                {selectedContract?.id === contract.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {/* PDF 图标 */}
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                    </svg>
                  </div>

                  {/* 合同信息 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate pr-8" title={contract.contractName}>
                      {contract.contractName}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <span>{contract.pageCount} 页</span>
                      <span>·</span>
                      <span>{formatFileSize(contract.fileSize)}</span>
                      <span>·</span>
                      <span>{getStatusLabel(contract.status)}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {formatTime(contract.createTime)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <div className="mt-6 pt-4 border-t flex justify-end">
        <button
          onClick={onNext}
          disabled={!selectedContract}
          className={`
            px-6 py-2.5 font-medium rounded-lg transition-colors
            ${selectedContract
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          下一步：选择印章
        </button>
      </div>
    </div>
  );
}
