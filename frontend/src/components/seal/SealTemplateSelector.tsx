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
 * 美化版本 - 横向卡片布局
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
  const getTemplateIcon = (code: string, isSelected: boolean) => {
    const color = isSelected ? '#DC2626' : '#9CA3AF';

    switch (code) {
      case 'standard_circle':
        // 圆形公章图标 - 带五角星
        return (
          <svg className="w-12 h-12" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="3" />
            <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="2,2" />
            <polygon
              points="50,18 54,34 70,34 57,44 62,60 50,50 38,60 43,44 30,34 46,34"
              fill={color}
            />
          </svg>
        );
      case 'oval_finance':
        // 椭圆财务章图标
        return (
          <svg className="w-14 h-10" viewBox="0 0 140 100">
            <ellipse cx="70" cy="50" rx="65" ry="42" fill="none" stroke={color} strokeWidth="3" />
            <text x="70" y="58" textAnchor="middle" fontSize="24" fontWeight="bold" fill={color}>财务</text>
          </svg>
        );
      case 'square_legal':
        // 方形法人章图标
        return (
          <svg className="w-10 h-10" viewBox="0 0 80 80">
            <rect x="4" y="4" width="72" height="72" fill="none" stroke={color} strokeWidth="3" rx="2" />
            <text x="40" y="48" textAnchor="middle" fontSize="20" fontWeight="bold" fill={color}>印</text>
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="3" />
          </svg>
        );
    }
  };

  // 获取模板描述
  const getTemplateDescription = (code: string) => {
    switch (code) {
      case 'standard_circle':
        return '企业公章标准样式';
      case 'oval_finance':
        return '适用于财务专用章';
      case 'square_legal':
        return '法人代表签名章';
      default:
        return '通用印章样式';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {templates.map((template) => {
        const isSelected = value === template.code;

        return (
          <button
            key={template.code}
            type="button"
            onClick={() => !disabled && onChange(template)}
            disabled={disabled}
            className={`
              w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200
              ${isSelected
                ? 'border-red-500 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg shadow-red-100'
                : 'border-gray-200 bg-white hover:border-red-200 hover:bg-red-50/30 hover:shadow-md'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* 左侧图标区域 */}
            <div className={`
              flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center
              ${isSelected ? 'bg-white shadow-inner' : 'bg-gray-50'}
            `}>
              {getTemplateIcon(template.code, isSelected)}
            </div>

            {/* 中间内容区域 */}
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`
                  font-semibold text-base truncate
                  ${isSelected ? 'text-red-700' : 'text-gray-800'}
                `}>
                  {template.name}
                </h3>
                {template.hasStar && (
                  <span className="flex-shrink-0 text-amber-500 text-sm">★</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {getTemplateDescription(template.code)}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  {template.baseSize}px
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {template.fontName}
                </span>
              </div>
            </div>

            {/* 右侧选中标记 */}
            <div className={`
              flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
              ${isSelected
                ? 'bg-red-500 border-red-500'
                : 'border-gray-300 bg-white'
              }
            `}>
              {isSelected && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
