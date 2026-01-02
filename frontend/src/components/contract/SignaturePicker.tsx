'use client';

import { useState, useEffect } from 'react';
import { type Signature, getSignatures, SIGNATURE_TYPES } from '@/lib/signature-api';
import { getFullFileUrl } from '@/lib/api';

interface SignaturePickerProps {
  /** 选中的签名 */
  value: Signature | null;
  /** 选择变化回调 */
  onChange: (signature: Signature | null) => void;
  /** 签名大小变化回调 */
  onSizeChange?: (size: number) => void;
  /** 默认签名大小 */
  defaultSize?: number;
  /** 用户ID（可选，用于筛选） */
  userId?: number;
  /** 是否显示大小调节 */
  showSizeControl?: boolean;
}

/**
 * 个人签名选择器组件
 *
 * 功能：
 * - 展示已有签名列表
 * - 选择签名
 * - 调节签名大小
 */
export default function SignaturePicker({
  value,
  onChange,
  onSizeChange,
  defaultSize = 60,
  userId,
  showSizeControl = true,
}: SignaturePickerProps) {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [signatureSize, setSignatureSize] = useState(defaultSize);
  const [filterType, setFilterType] = useState<number | undefined>(undefined);

  // 加载签名列表
  useEffect(() => {
    const loadSignatures = async () => {
      setLoading(true);
      try {
        const response = await getSignatures({
          userId,
          status: 1, // 只获取启用的签名
          signatureType: filterType,
          size: 50,
        });
        if (response.success && response.data) {
          setSignatures(response.data.content || []);
        }
      } catch (error) {
        console.error('加载签名列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSignatures();
  }, [userId, filterType]);

  // 大小变化通知
  const handleSizeChange = (newSize: number) => {
    setSignatureSize(newSize);
    onSizeChange?.(newSize);
  };

  // 选择签名
  const handleSelect = (signature: Signature) => {
    if (value?.id === signature.id) {
      onChange(null); // 取消选择
    } else {
      onChange(signature);
    }
  };

  // 获取签名图片URL
  const getImageUrl = (signature: Signature) => {
    if (signature.signatureImageUrl) {
      return signature.signatureImageUrl;
    }
    if (signature.signatureImage) {
      return getFullFileUrl(signature.signatureImage);
    }
    return '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* 筛选和大小控制 */}
      <div className="p-3 border-b space-y-3">
        {/* 类型筛选 */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">签名类型</label>
          <select
            value={filterType || ''}
            onChange={(e) => setFilterType(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-green-500"
          >
            <option value="">全部类型</option>
            {SIGNATURE_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* 大小调节 */}
        {showSizeControl && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              签名大小: {signatureSize}px
            </label>
            <input
              type="range"
              min={30}
              max={120}
              step={10}
              value={signatureSize}
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

      {/* 签名列表 */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        ) : signatures.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <p className="text-sm">暂无可用签名</p>
            <a
              href="/signatures/create"
              className="inline-block mt-2 text-sm text-green-600 hover:text-green-700"
            >
              去创建签名
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {signatures.map((signature) => (
              <button
                key={signature.id}
                onClick={() => handleSelect(signature)}
                className={`
                  relative p-2 rounded-lg border-2 transition-all
                  ${value?.id === signature.id
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                {/* 选中标记 */}
                {value?.id === signature.id && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* 默认标记 */}
                {signature.isDefault === 1 && (
                  <div className="absolute top-1 left-1 px-1 py-0.5 bg-yellow-400 text-yellow-900 text-xs rounded">
                    默认
                  </div>
                )}

                {/* 签名图片 */}
                <div className="flex justify-center mb-1">
                  <img
                    src={getImageUrl(signature)}
                    alt={signature.signatureName}
                    className="w-[60px] h-[40px] object-contain"
                  />
                </div>

                {/* 签名名称 */}
                <p className="text-xs text-center text-gray-700 truncate">
                  {signature.signatureName}
                </p>

                {/* 签名类型 */}
                <p className="text-xs text-center text-gray-400">
                  {signature.signatureTypeDesc}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 当前选中信息 */}
      {value && (
        <div className="p-3 border-t bg-green-50">
          <div className="flex items-center gap-2">
            <img
              src={getImageUrl(value)}
              alt={value.signatureName}
              className="w-[40px] h-[28px] object-contain"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {value.signatureName}
              </p>
              <p className="text-xs text-gray-500">
                点击页面放置签名
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
