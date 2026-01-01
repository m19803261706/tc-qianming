'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSealRecords, type SealRecord } from '@/lib/contract-api';
import { getFullFileUrl } from '@/lib/api';

interface SealRecordTimelineProps {
  /** 合同ID */
  contractId: number;
  /** 刷新触发器 */
  refreshTrigger?: number;
}

/**
 * 盖章记录时间线
 *
 * 功能：
 * - 展示签章历史记录
 * - 时间线样式
 * - 印章预览
 * - 操作人信息
 */
export default function SealRecordTimeline({
  contractId,
  refreshTrigger,
}: SealRecordTimelineProps) {
  const [records, setRecords] = useState<SealRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载签章记录
  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getSealRecords(contractId);
      if (response.success && response.data) {
        // 按时间倒序排列
        const sorted = [...response.data].sort(
          (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
        );
        setRecords(sorted);
      } else {
        setError(response.message || '加载失败');
      }
    } catch (err) {
      console.error('加载签章记录失败:', err);
      setError('加载签章记录失败');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  // 初始加载和刷新
  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshTrigger]);

  // 格式化时间
  const formatTime = (timeStr: string): string => {
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 获取印章类型颜色
  const getSealTypeColor = (type: number) => {
    switch (type) {
      case 1:
        return 'bg-red-500'; // 普通章
      case 2:
        return 'bg-purple-500'; // 骑缝章
      case 3:
        return 'bg-blue-500'; // 个人签名
      default:
        return 'bg-gray-500';
    }
  };

  // 获取印章类型图标
  const getSealTypeIcon = (type: number) => {
    switch (type) {
      case 1:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 2:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 3:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gray-500">加载中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        {error}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg">暂无签章记录</p>
        <p className="text-sm mt-1">该合同尚未进行签章操作</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {records.map((record, index) => (
          <li key={record.id}>
            <div className="relative pb-8">
              {/* 连接线 */}
              {index !== records.length - 1 && (
                <span
                  className="absolute left-5 top-10 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}

              <div className="relative flex items-start space-x-3">
                {/* 时间线节点 */}
                <div className="relative">
                  <div className={`
                    h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white
                    ${getSealTypeColor(record.sealType)}
                  `}>
                    <span className="text-white">
                      {getSealTypeIcon(record.sealType)}
                    </span>
                  </div>
                </div>

                {/* 记录内容 */}
                <div className="flex-1 min-w-0">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    {/* 头部信息 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {record.sealName}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {record.sealTypeDesc}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTime(record.createTime)}
                      </span>
                    </div>

                    {/* 印章预览 */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getFullFileUrl(record.sealImageUrl)}
                          alt={record.sealName}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <span className="text-gray-400">位置:</span>{' '}
                          第 {record.pageNumber} 页 ({Math.round(record.positionX)}, {Math.round(record.positionY)})
                        </div>
                        <div>
                          <span className="text-gray-400">尺寸:</span>{' '}
                          {Math.round(record.sealWidth)} × {Math.round(record.sealHeight)} px
                        </div>
                      </div>
                    </div>

                    {/* 操作人 */}
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      操作人: {record.operatorName || `用户${record.operatorId}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
