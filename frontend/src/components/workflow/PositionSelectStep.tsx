'use client';

import { useState, useCallback, useMemo } from 'react';
import { PdfViewer, SealPositionPicker, type SealPlacement, placementToSealPosition, sealToStampItem } from '@/components/contract';
import { type Seal } from '@/lib/seal-api';
import { type Contract, type SealPosition, type ContractSealRequest, sealContract } from '@/lib/contract-api';
import { getFullFileUrl } from '@/lib/api';

interface PositionSelectStepProps {
  /** 合同 */
  contract: Contract;
  /** 印章 */
  seal: Seal;
  /** 印章大小 */
  sealSize: number;
  /** 操作人ID */
  operatorId: number;
  /** 操作人姓名 */
  operatorName?: string;
  /** 上一步回调 */
  onPrev: () => void;
  /** 完成回调 */
  onComplete: (success: boolean, message: string) => void;
}

/**
 * 位置选择步骤
 *
 * 功能：
 * - PDF 预览
 * - 点击放置印章
 * - 拖拽调整位置
 * - 执行盖章
 */
export default function PositionSelectStep({
  contract,
  seal,
  sealSize,
  operatorId,
  operatorName,
  onPrev,
  onComplete,
}: PositionSelectStepProps) {
  const [placements, setPlacements] = useState<SealPlacement[]>([]);
  const [pageSize, setPageSize] = useState({ width: 600, height: 800 });
  // PDF 实际尺寸（pt），用于精确坐标转换
  const [pdfSize, setPdfSize] = useState({ width: 595, height: 842 });
  const [submitting, setSubmitting] = useState(false);

  // 将印章转换为通用 StampItem 接口
  const stampItem = useMemo(() => sealToStampItem(seal), [seal]);

  // 添加印章放置
  const handleAddPlacement = useCallback((placement: SealPlacement) => {
    setPlacements(prev => [...prev, { ...placement, width: sealSize, height: sealSize }]);
  }, [sealSize]);

  // 更新印章位置
  const handleUpdatePlacement = useCallback((id: string, updates: Partial<SealPlacement>) => {
    setPlacements(prev =>
      prev.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  }, []);

  // 删除印章
  const handleRemovePlacement = useCallback((id: string) => {
    setPlacements(prev => prev.filter(p => p.id !== id));
  }, []);

  // 清空所有印章
  const handleClearAll = useCallback(() => {
    setPlacements([]);
  }, []);

  // 渲染叠加层
  const renderOverlay = useCallback((
    page: number,
    pageWidth: number,
    pageHeight: number,
    pdfWidth: number,
    pdfHeight: number
  ) => {
    // 更新预览图像素尺寸
    if (pageWidth !== pageSize.width || pageHeight !== pageSize.height) {
      setPageSize({ width: pageWidth, height: pageHeight });
    }
    // 更新 PDF 实际尺寸（pt）
    if (pdfWidth !== pdfSize.width || pdfHeight !== pdfSize.height) {
      setPdfSize({ width: pdfWidth, height: pdfHeight });
    }

    return (
      <SealPositionPicker
        pageNumber={page}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
        selectedSeal={stampItem}
        placements={placements}
        onAddPlacement={handleAddPlacement}
        onUpdatePlacement={handleUpdatePlacement}
        onRemovePlacement={handleRemovePlacement}
        defaultSealSize={sealSize}
      />
    );
  }, [stampItem, placements, sealSize, pageSize, pdfSize, handleAddPlacement, handleUpdatePlacement, handleRemovePlacement]);

  // 执行盖章
  const handleSubmit = async () => {
    if (placements.length === 0) {
      alert('请先在 PDF 上放置印章位置');
      return;
    }

    setSubmitting(true);

    try {
      // 转换位置为 API 格式（使用实际 PDF 尺寸进行精确转换）
      const positions: SealPosition[] = placements.map(p =>
        placementToSealPosition(p, pageSize.width, pageSize.height, pdfSize.width, pdfSize.height)
      );

      const request: ContractSealRequest = {
        sealId: seal.id,
        positions,
        operatorId,
        operatorName,
        sealType: 1,
      };

      const response = await sealContract(contract.id, request);

      if (response.success) {
        onComplete(true, '签章成功');
      } else {
        onComplete(false, response.message || '签章失败');
      }
    } catch (error) {
      console.error('签章失败:', error);
      onComplete(false, '签章失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 统计信息
  const placementCount = placements.length;
  const pageCount = new Set(placements.map(p => p.pageNumber)).size;

  return (
    <div className="flex flex-col h-full">
      {/* 标题 */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">选择盖章位置</h2>
        <p className="text-sm text-gray-500 mt-1">
          点击 PDF 页面放置印章，可拖拽调整位置
        </p>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* PDF 预览区 */}
        <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
          <PdfViewer
            contractId={contract.id}
            renderOverlay={renderOverlay}
            showPageNumbers
            heightClassName="h-full"
          />
        </div>

        {/* 右侧操作面板 */}
        <div className="w-64 flex flex-col bg-white rounded-lg border">
          {/* 印章信息 */}
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium text-gray-700 mb-3">当前印章</h3>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getFullFileUrl(seal.sealImageUrl)}
                  alt={seal.sealName}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{seal.sealName}</p>
                <p className="text-xs text-gray-500">{seal.sealTypeDesc}</p>
              </div>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="p-4 border-b bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">已放置印章</span>
              <span className="font-medium text-blue-600">{placementCount} 个</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">涉及页数</span>
              <span className="font-medium">{pageCount} 页</span>
            </div>
          </div>

          {/* 印章位置列表 */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-700 mb-2">印章位置</h3>
            {placements.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-4">
                点击 PDF 页面放置印章
              </div>
            ) : (
              <div className="space-y-2">
                {placements.map((p, index) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded text-xs"
                  >
                    <span>
                      {index + 1}. 第 {p.pageNumber} 页
                    </span>
                    <button
                      onClick={() => handleRemovePlacement(p.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 清空按钮 */}
          {placements.length > 0 && (
            <div className="p-4 border-t">
              <button
                onClick={handleClearAll}
                disabled={submitting}
                className="w-full py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                清空所有
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 底部操作 */}
      <div className="mt-4 pt-4 border-t flex justify-between">
        <button
          onClick={onPrev}
          disabled={submitting}
          className="px-6 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          上一步
        </button>
        <button
          onClick={handleSubmit}
          disabled={placements.length === 0 || submitting}
          className={`
            px-6 py-2.5 font-medium rounded-lg transition-colors
            ${placements.length > 0
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
            disabled:opacity-50
          `}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              签章中...
            </span>
          ) : (
            `执行签章 (${placementCount})`
          )}
        </button>
      </div>
    </div>
  );
}
