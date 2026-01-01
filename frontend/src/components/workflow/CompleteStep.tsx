'use client';

import Link from 'next/link';
import { type Contract } from '@/lib/contract-api';

interface CompleteStepProps {
  /** 合同 */
  contract: Contract;
  /** 是否成功 */
  success: boolean;
  /** 消息 */
  message: string;
  /** 重新开始回调 */
  onRestart: () => void;
}

/**
 * 完成步骤
 *
 * 功能：
 * - 显示签章结果
 * - 下载按钮
 * - 查看详情链接
 * - 重新开始按钮
 */
export default function CompleteStep({
  contract,
  success,
  message,
  onRestart,
}: CompleteStepProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      {/* 结果图标 */}
      <div
        className={`
          w-24 h-24 rounded-full flex items-center justify-center
          ${success ? 'bg-green-100' : 'bg-red-100'}
        `}
      >
        {success ? (
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>

      {/* 标题和消息 */}
      <h2 className={`mt-6 text-2xl font-bold ${success ? 'text-green-600' : 'text-red-600'}`}>
        {success ? '签章完成！' : '签章失败'}
      </h2>
      <p className="mt-2 text-gray-500">{message}</p>

      {/* 合同信息 */}
      {success && (
        <div className="mt-8 p-6 bg-gray-50 rounded-xl max-w-md w-full">
          <h3 className="text-sm font-medium text-gray-700 mb-4">合同信息</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">文件名</span>
              <span className="text-gray-900 font-medium truncate max-w-[200px]" title={contract.originalName}>
                {contract.originalName}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">页数</span>
              <span className="text-gray-900">{contract.totalPages} 页</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">状态</span>
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                已签章
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {success ? (
          <>
            {/* 下载按钮 */}
            <a
              href={contract.fileUrl}
              download={contract.originalName}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              下载合同
            </a>

            {/* 查看详情 */}
            <Link
              href={`/contracts/${contract.id}`}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              查看详情
            </Link>

            {/* 继续签章 */}
            <button
              onClick={onRestart}
              className="inline-flex items-center px-6 py-3 text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              签章新合同
            </button>
          </>
        ) : (
          <>
            {/* 重试按钮 */}
            <button
              onClick={onRestart}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重新尝试
            </button>

            {/* 返回列表 */}
            <Link
              href="/contracts"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              返回合同列表
            </Link>
          </>
        )}
      </div>

      {/* 底部链接 */}
      <div className="mt-12 text-center text-sm text-gray-400">
        <Link href="/contracts" className="hover:text-gray-600">
          返回合同列表
        </Link>
        <span className="mx-3">|</span>
        <Link href="/seals" className="hover:text-gray-600">
          管理印章
        </Link>
      </div>
    </div>
  );
}
