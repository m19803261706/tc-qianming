'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSeals, type Seal, SEAL_TYPES } from '@/lib/seal-api';
import { getFullFileUrl } from '@/lib/api';

interface SealSelectStepProps {
  /** 选中的印章 */
  selectedSeal: Seal | null;
  /** 选择回调 */
  onSelect: (seal: Seal) => void;
  /** 印章大小 */
  sealSize: number;
  /** 大小变化回调 */
  onSizeChange: (size: number) => void;
  /** 上一步回调 */
  onPrev: () => void;
  /** 下一步回调 */
  onNext: () => void;
}

/**
 * 印章选择步骤
 *
 * 功能：
 * - 按类型筛选印章
 * - 印章卡片展示
 * - 大小调节
 */
export default function SealSelectStep({
  selectedSeal,
  onSelect,
  sealSize,
  onSizeChange,
  onPrev,
  onNext,
}: SealSelectStepProps) {
  const [seals, setSeals] = useState<Seal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<number | null>(null);

  // 加载印章列表
  const loadSeals = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, number | undefined> = {
        size: 50,
        status: 1, // 只显示启用的
      };
      if (filterType !== null) {
        params.sealType = filterType;
      }
      const response = await getSeals(params);
      if (response.success && response.data) {
        setSeals(response.data.content);
      }
    } catch (err) {
      console.error('加载印章列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    loadSeals();
  }, [loadSeals]);

  // 按类型分组
  const groupedSeals = seals.reduce((acc, seal) => {
    const type = seal.sealType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(seal);
    return acc;
  }, {} as Record<number, Seal[]>);

  return (
    <div className="flex flex-col h-full">
      {/* 标题 */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">选择印章</h2>
        <p className="text-sm text-gray-500 mt-1">
          选择要使用的印章，可以调整印章大小
        </p>
      </div>

      {/* 筛选和大小调节 */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        {/* 类型筛选 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType(null)}
            className={`
              px-3 py-1.5 text-sm rounded-lg transition-colors
              ${filterType === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            全部
          </button>
          {SEAL_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setFilterType(type.value)}
              className={`
                px-3 py-1.5 text-sm rounded-lg transition-colors
                ${filterType === type.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* 大小调节 */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">大小:</span>
          <input
            type="range"
            min="40"
            max="160"
            step="10"
            value={sealSize}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-gray-600 w-12">{sealSize}px</span>
        </div>
      </div>

      {/* 印章列表 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : seals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="mt-4">暂无可用印章</p>
            <p className="text-sm mt-1">请先在印章管理中添加印章</p>
          </div>
        ) : filterType === null ? (
          // 按类型分组显示
          <div className="space-y-6">
            {Object.entries(groupedSeals).map(([typeStr, typeSeals]) => {
              const type = Number(typeStr);
              const typeInfo = SEAL_TYPES.find(t => t.value === type);
              return (
                <div key={type}>
                  <h3 className="text-sm font-medium text-gray-600 mb-3">
                    {typeInfo?.label || '其他'} ({typeSeals.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {typeSeals.map((seal) => (
                      <SealCard
                        key={seal.id}
                        seal={seal}
                        selected={selectedSeal?.id === seal.id}
                        sealSize={sealSize}
                        onSelect={() => onSelect(seal)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // 直接显示筛选结果
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {seals.map((seal) => (
              <SealCard
                key={seal.id}
                seal={seal}
                selected={selectedSeal?.id === seal.id}
                sealSize={sealSize}
                onSelect={() => onSelect(seal)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <div className="mt-6 pt-4 border-t flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          上一步
        </button>
        <button
          onClick={onNext}
          disabled={!selectedSeal}
          className={`
            px-6 py-2.5 font-medium rounded-lg transition-colors
            ${selectedSeal
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          下一步：选择位置
        </button>
      </div>
    </div>
  );
}

// 印章卡片组件
function SealCard({
  seal,
  selected,
  sealSize,
  onSelect,
}: {
  seal: Seal;
  selected: boolean;
  sealSize: number;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`
        relative p-3 rounded-lg border-2 cursor-pointer transition-all
        ${selected
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }
      `}
    >
      {/* 选中标记 */}
      {selected && (
        <div className="absolute top-1 right-1">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* 印章图片 */}
      <div
        className="flex items-center justify-center bg-white rounded-lg mb-2"
        style={{ height: Math.min(sealSize + 20, 120) }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getFullFileUrl(seal.sealImageUrl)}
          alt={seal.sealName}
          style={{ width: Math.min(sealSize, 100), height: Math.min(sealSize, 100) }}
          className="object-contain"
        />
      </div>

      {/* 印章名称 */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900 truncate" title={seal.sealName}>
          {seal.sealName}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {seal.sealTypeDesc}
        </p>
      </div>
    </div>
  );
}
