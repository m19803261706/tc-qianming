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
 * 印章生成器组件 - 紧凑版布局
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
      size="4xl"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧：配置区域 */}
        <div className="flex-1 space-y-4">
          {/* 步骤 1: 选择模板 */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-md flex items-center justify-center text-xs font-bold">
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

          {/* 步骤 2 & 3: 企业名称和中心文字 - 横向排列 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 企业名称 */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-md flex items-center justify-center text-xs font-bold">
                  2
                </span>
                企业名称
                <span className="text-red-500 text-xs ml-1">*必填</span>
              </h3>
              <div className="relative">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  maxLength={30}
                  disabled={generating}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-400 disabled:bg-gray-100 transition-all text-gray-800 text-sm placeholder-gray-400"
                  placeholder="输入企业/组织名称"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {companyName.length}/30
                </span>
              </div>
            </div>

            {/* 中心文字 */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-gray-300 text-white rounded-md flex items-center justify-center text-xs font-bold">
                  3
                </span>
                中心文字
                <span className="text-gray-400 text-xs ml-1">可选</span>
              </h3>
              <input
                type="text"
                value={centerText}
                onChange={(e) => setCenterText(e.target.value)}
                maxLength={10}
                disabled={generating}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-400 disabled:bg-gray-100 transition-all text-gray-800 text-sm placeholder-gray-400"
                placeholder="如：合同专用章"
              />
            </div>
          </div>

          {/* 步骤 4: 颜色选择 */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-gray-300 text-white rounded-md flex items-center justify-center text-xs font-bold">
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
                    flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm
                    ${sealColor === color.value
                      ? 'bg-white shadow-md ring-2 ring-red-200'
                      : 'bg-white/60 hover:bg-white hover:shadow-sm'
                    }
                    disabled:opacity-50
                  `}
                >
                  <span
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className={sealColor === color.value ? 'text-gray-800 font-medium' : 'text-gray-600'}>
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：预览区域 */}
        <div className="w-full lg:w-72 flex flex-col">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 flex-1 flex flex-col">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              预览效果
            </h3>

            {/* 预览内容 */}
            <div className="flex-1 min-h-[200px] bg-white rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
              {previewUrl ? (
                <div className="text-center p-3">
                  <div className="relative inline-block p-2 bg-gradient-to-br from-gray-50 to-white rounded-lg">
                    <Image
                      src={previewUrl}
                      alt="印章预览"
                      width={140}
                      height={140}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1 text-green-600 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">生成成功</span>
                  </div>
                </div>
              ) : generating ? (
                <div className="text-center text-gray-400">
                  <div className="relative w-14 h-14 mx-auto mb-2">
                    <div className="absolute inset-0 rounded-full border-3 border-gray-200"></div>
                    <div className="absolute inset-0 rounded-full border-3 border-red-500 border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-sm font-medium">生成中...</p>
                </div>
              ) : (
                <div className="text-center text-gray-400 p-4">
                  <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500">等待生成</p>
                  <p className="text-xs mt-1">点击下方按钮生成</p>
                </div>
              )}
            </div>

            {/* 生成按钮 */}
            <button
              type="button"
              onClick={handleGeneratePreview}
              disabled={!canGenerate || generating}
              className={`
                w-full mt-3 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm
                ${canGenerate && !generating
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-lg shadow-red-200/50 active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {generating ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  生成中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  生成预览
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          {previewResult ? (
            <span className="text-green-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              印章已就绪
            </span>
          ) : (
            '生成后可使用印章'
          )}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={generating}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!previewResult || generating}
            className={`
              px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2
              ${previewResult
                ? 'text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-md'
                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }
            `}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            使用此印章
          </button>
        </div>
      </div>
    </Modal>
  );
}
