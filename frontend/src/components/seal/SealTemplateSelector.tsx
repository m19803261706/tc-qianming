'use client';

import { useState, useEffect } from 'react';
import { type SealTemplate, getSealTemplates } from '@/lib/seal-api';

interface SealTemplateSelectorProps {
  /** 选中的模板代码 */
  value?: string;
  /** 选择变化回调 */
  onChange: (template: SealTemplate) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 印章模板选择器组件
 *
 * 展示所有可用的印章模板，支持选择交互
 */
export default function SealTemplateSelector({
  value,
  onChange,
  disabled = false,
}: SealTemplateSelectorProps) {
  const [templates, setTemplates] = useState<SealTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载模板列表
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await getSealTemplates();
        if (response.success) {
          setTemplates(response.data);
          // 如果没有选中项，默认选中第一个
          if (!value && response.data.length > 0) {
            onChange(response.data[0]);
          }
        }
      } catch (error) {
        console.error('加载模板列表失败:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 获取模板的预览图标
  const getTemplateIcon = (code: string) => {
    switch (code) {
      case 'standard_circle':
        // 圆形公章图标
        return (
          <svg className="w-16 h-16" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
            <polygon
              points="50,20 55,38 74,38 59,49 64,67 50,56 36,67 41,49 26,38 45,38"
              fill="currentColor"
            />
          </svg>
        );
      case 'oval_finance':
        // 椭圆财务章图标
        return (
          <svg className="w-16 h-12" viewBox="0 0 120 80">
            <ellipse cx="60" cy="40" rx="55" ry="35" fill="none" stroke="currentColor" strokeWidth="4" />
            <text x="60" y="48" textAnchor="middle" fontSize="18" fill="currentColor">财</text>
          </svg>
        );
      case 'square_legal':
        // 方形法人章图标
        return (
          <svg className="w-14 h-14" viewBox="0 0 80 80">
            <rect x="5" y="5" width="70" height="70" fill="none" stroke="currentColor" strokeWidth="4" />
            <text x="40" y="50" textAnchor="middle" fontSize="24" fill="currentColor">章</text>
          </svg>
        );
      default:
        return (
          <svg className="w-16 h-16" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {templates.map((template) => (
        <button
          key={template.code}
          type="button"
          onClick={() => !disabled && onChange(template)}
          disabled={disabled}
          className={`
            relative p-4 rounded-xl border-2 transition-all duration-200
            ${value === template.code
              ? 'border-red-500 bg-red-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-sm'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {/* 选中标记 */}
          {value === template.code && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          {/* 模板图标 */}
          <div className={`
            flex justify-center mb-3
            ${value === template.code ? 'text-red-600' : 'text-red-400'}
          `}>
            {getTemplateIcon(template.code)}
          </div>

          {/* 模板名称 */}
          <h3 className={`
            text-center font-medium
            ${value === template.code ? 'text-red-700' : 'text-gray-700'}
          `}>
            {template.name}
          </h3>

          {/* 模板信息 */}
          <div className="mt-2 text-center text-xs text-gray-500 space-y-0.5">
            <p>尺寸: {template.baseSize}px</p>
            <p>字体: {template.fontName}</p>
            {template.hasStar && (
              <p className="text-red-500">★ 带五角星</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
