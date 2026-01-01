'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import SealTemplateSelector from './SealTemplateSelector';
import {
  type SealTemplate,
  type SealGenerateRequest,
  type FileUploadResponse,
  generateSeal,
} from '@/lib/seal-api';

interface SealGeneratorProps {
  /** 是否显示弹窗 */
  isOpen: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 生成成功回调，传递生成的图片信息 */
  onSuccess: (result: FileUploadResponse) => void;
}

/**
 * 印章生成器组件
 *
 * 提供印章自动生成功能，包括：
 * - 模板选择
 * - 企业名称输入
 * - 中心文字输入
 * - 颜色选择
 * - 实时预览
 */
export default function SealGenerator({
  isOpen,
  onClose,
  onSuccess,
}: SealGeneratorProps) {
  // 表单状态
  const [selectedTemplate, setSelectedTemplate] = useState<SealTemplate | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [centerText, setCenterText] = useState('');
  const [sealColor, setSealColor] = useState('#DC2626'); // 默认红色

  // 加载状态
  const [generating, setGenerating] = useState(false);

  // 预览图片
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<FileUploadResponse | null>(null);

  // 预设颜色
  const presetColors = [
    { name: '标准红', value: '#DC2626' },
    { name: '深红', value: '#991B1B' },
    { name: '朱红', value: '#EF4444' },
    { name: '蓝色', value: '#2563EB' },
    { name: '黑色', value: '#1F2937' },
  ];

  // 生成预览
  const handleGeneratePreview = useCallback(async () => {
    if (!selectedTemplate || !companyName.trim()) {
      return;
    }

    setGenerating(true);
    setPreviewUrl(null);
    setPreviewResult(null);

    try {
      const request: SealGenerateRequest = {
        companyName: companyName.trim(),
        centerText: centerText.trim() || undefined,
        templateCode: selectedTemplate.code,
        color: sealColor,
      };

      const response = await generateSeal(request);
      if (response.success) {
        setPreviewUrl(response.data.fileUrl);
        setPreviewResult(response.data);
      } else {
        alert(response.message || '生成失败');
      }
    } catch (error) {
      console.error('生成印章失败:', error);
      alert('生成印章失败，请重试');
    } finally {
      setGenerating(false);
    }
  }, [selectedTemplate, companyName, centerText, sealColor]);

  // 确认使用生成的印章
  const handleConfirm = () => {
    if (previewResult) {
      onSuccess(previewResult);
      handleClose();
    }
  };

  // 关闭并重置
  const handleClose = () => {
    setSelectedTemplate(null);
    setCompanyName('');
    setCenterText('');
    setSealColor('#DC2626');
    setPreviewUrl(null);
    setPreviewResult(null);
    onClose();
  };

  // 检查是否可以生成
  const canGenerate = selectedTemplate && companyName.trim().length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="自动生成印章"
      size="xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：配置区域 */}
        <div className="space-y-5">
          {/* 步骤 1: 选择模板 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                1
              </span>
              选择印章模板
            </h3>
            <SealTemplateSelector
              value={selectedTemplate?.code}
              onChange={setSelectedTemplate}
              disabled={generating}
            />
          </div>

          {/* 步骤 2: 输入企业名称 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                2
              </span>
              输入企业名称
              <span className="text-red-500">*</span>
            </h3>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              maxLength={30}
              disabled={generating}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="请输入企业/组织名称（将环绕显示）"
            />
            <p className="mt-1 text-xs text-gray-500">
              {companyName.length}/30 字符
            </p>
          </div>

          {/* 步骤 3: 输入中心文字（可选） */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs">
                3
              </span>
              中心文字
              <span className="text-gray-400 text-xs">（可选）</span>
            </h3>
            <input
              type="text"
              value={centerText}
              onChange={(e) => setCenterText(e.target.value)}
              maxLength={10}
              disabled={generating}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="如：合同专用章、财务专用章"
            />
          </div>

          {/* 步骤 4: 选择颜色 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs">
                4
              </span>
              印章颜色
            </h3>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSealColor(color.value)}
                  disabled={generating}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all
                    ${sealColor === color.value
                      ? 'border-gray-800 shadow-md'
                      : 'border-transparent hover:border-gray-300'
                    }
                    disabled:opacity-50
                  `}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-sm text-gray-700">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 生成按钮 */}
          <button
            type="button"
            onClick={handleGeneratePreview}
            disabled={!canGenerate || generating}
            className={`
              w-full py-3 rounded-lg font-medium transition-all
              ${canGenerate
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
              disabled:opacity-50
            `}
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                生成中...
              </span>
            ) : (
              '生成预览'
            )}
          </button>
        </div>

        {/* 右侧：预览区域 */}
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">预览效果</h3>
          <div className="flex-1 min-h-[300px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
            {previewUrl ? (
              <div className="text-center">
                <div className="relative inline-block">
                  <Image
                    src={previewUrl}
                    alt="印章预览"
                    width={200}
                    height={200}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <p className="mt-3 text-sm text-green-600 font-medium">
                  ✓ 印章生成成功
                </p>
              </div>
            ) : generating ? (
              <div className="text-center text-gray-400">
                <svg className="animate-spin w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p>正在生成印章...</p>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p>请配置参数并点击【生成预览】</p>
              </div>
            )}
          </div>

          {/* 使用提示 */}
          {previewUrl && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <p className="font-medium mb-1">💡 提示</p>
              <p>点击【使用此印章】将图片信息返回，您可以用它创建新印章。</p>
            </div>
          )}
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <button
          type="button"
          onClick={handleClose}
          disabled={generating}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          取消
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!previewResult || generating}
          className={`
            px-5 py-2 text-sm font-medium rounded-lg transition-colors
            ${previewResult
              ? 'text-white bg-green-600 hover:bg-green-700'
              : 'text-gray-500 bg-gray-200 cursor-not-allowed'
            }
            disabled:opacity-50
          `}
        >
          使用此印章
        </button>
      </div>
    </Modal>
  );
}
