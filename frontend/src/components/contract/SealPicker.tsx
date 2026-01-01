'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { type Seal, getSeals, SEAL_TYPES } from '@/lib/seal-api';

interface SealPickerProps {
  /** 选中的印章 */
  value: Seal | null;
  /** 选择变化回调 */
  onChange: (seal: Seal | null) => void;
  /** 印章大小变化回调 */
  onSizeChange?: (size: number) => void;
  /** 默认印章大小 */
  defaultSize?: number;
  /** 所有者ID（可选，用于筛选） */
  ownerId?: number;
  /** 是否显示大小调节 */
  showSizeControl?: boolean;
}

/**
 * 印章选择器组件
 *
 * 功能：
 * - 展示已有印章列表
 * - 选择印章
 * - 调节印章大小
 */
export default function SealPicker({
  value,
  onChange,
  onSizeChange,
  defaultSize = 80,
  ownerId,
  showSizeControl = true,
}: SealPickerProps) {
  const [seals, setSeals] = useState<Seal[]>([]);
  const [loading, setLoading] = useState(true);
  const [sealSize, setSealSize] = useState(defaultSize);
  const [filterType, setFilterType] = useState<number | undefined>(undefined);

  // 加载印章列表
  useEffect(() => {
    const loadSeals = async () => {
      setLoading(true);
      try {
        const response = await getSeals({
          ownerId,
          status: 1, // 只获取启用的印章
          sealType: filterType,
          size: 50,
        });
        if (response.success) {
          setSeals(response.data.content);
        }
      } catch (error) {
        console.error('加载印章列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSeals();
  }, [ownerId, filterType]);

  // 大小变化通知
  const handleSizeChange = (newSize: number) => {
    setSealSize(newSize);
    onSizeChange?.(newSize);
  };

  // 选择印章
  const handleSelect = (seal: Seal) => {
    if (value?.id === seal.id) {
      onChange(null); // 取消选择
    } else {
      onChange(seal);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 筛选和大小控制 */}
      <div className="p-3 border-b space-y-3">
        {/* 类型筛选 */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">印章类型</label>
          <select
            value={filterType || ''}
            onChange={(e) => setFilterType(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部类型</option>
            {SEAL_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* 大小调节 */}
        {showSizeControl && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              印章大小: {sealSize}px
            </label>
            <input
              type="range"
              min={40}
              max={160}
              step={10}
              value={sealSize}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>小</span>
              <span>大</span>
            </div>
          </div>
        )}
      </div>

      {/* 印章列表 */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : seals.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-sm">暂无可用印章</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {seals.map((seal) => (
              <button
                key={seal.id}
                onClick={() => handleSelect(seal)}
                className={`
                  relative p-2 rounded-lg border-2 transition-all
                  ${value?.id === seal.id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                {/* 选中标记 */}
                {value?.id === seal.id && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* 印章图片 */}
                <div className="flex justify-center mb-1">
                  <Image
                    src={seal.sealImageUrl}
                    alt={seal.sealName}
                    width={60}
                    height={60}
                    className="object-contain"
                    unoptimized
                  />
                </div>

                {/* 印章名称 */}
                <p className="text-xs text-center text-gray-700 truncate">
                  {seal.sealName}
                </p>

                {/* 印章类型 */}
                <p className="text-xs text-center text-gray-400">
                  {seal.sealTypeDesc}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 当前选中信息 */}
      {value && (
        <div className="p-3 border-t bg-blue-50">
          <div className="flex items-center gap-2">
            <Image
              src={value.sealImageUrl}
              alt={value.sealName}
              width={32}
              height={32}
              className="object-contain"
              unoptimized
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {value.sealName}
              </p>
              <p className="text-xs text-gray-500">
                点击页面放置印章
              </p>
            </div>
            <button
              onClick={() => onChange(null)}
              className="text-gray-400 hover:text-gray-600"
              title="取消选择"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
