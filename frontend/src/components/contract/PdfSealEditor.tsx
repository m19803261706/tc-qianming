'use client';

import { useState, useCallback } from 'react';
import PdfViewer from './PdfViewer';
import SealPicker from './SealPicker';
import SealPositionPicker, { type SealPlacement, placementToSealPosition } from './SealPositionPicker';
import { type Seal } from '@/lib/seal-api';
import { type SealPosition, type ContractSealRequest, sealContract } from '@/lib/contract-api';

interface PdfSealEditorProps {
  /** 合同ID */
  contractId: number;
  /** 操作人ID */
  operatorId: number;
  /** 操作人姓名 */
  operatorName?: string;
  /** 盖章完成回调 */
  onSealComplete?: (result: { success: boolean; message: string }) => void;
  /** 高度 */
  height?: string;
}

/**
 * PDF 盖章编辑器
 *
 * 整合 PDF 预览、印章选择、位置选择的完整盖章编辑器
 */
export default function PdfSealEditor({
  contractId,
  operatorId,
  operatorName,
  onSealComplete,
  height = 'h-[700px]',
}: PdfSealEditorProps) {
  // 选中的印章
  const [selectedSeal, setSelectedSeal] = useState<Seal | null>(null);
  // 印章大小
  const [sealSize, setSealSize] = useState(80);
  // 已放置的印章
  const [placements, setPlacements] = useState<SealPlacement[]>([]);
  // 当前页码
  const [currentPage, setCurrentPage] = useState(1);
  // 页面尺寸
  const [pageSize, setPageSize] = useState({ width: 600, height: 800 });
  // 提交状态
  const [submitting, setSubmitting] = useState(false);

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
  const renderOverlay = useCallback((page: number, pageWidth: number, pageHeight: number) => {
    // 保存页面尺寸
    if (pageWidth !== pageSize.width || pageHeight !== pageSize.height) {
      setPageSize({ width: pageWidth, height: pageHeight });
    }

    return (
      <SealPositionPicker
        pageNumber={page}
        pageWidth={pageWidth}
        pageHeight={pageHeight}
        selectedSeal={selectedSeal}
        placements={placements}
        onAddPlacement={handleAddPlacement}
        onUpdatePlacement={handleUpdatePlacement}
        onRemovePlacement={handleRemovePlacement}
        defaultSealSize={sealSize}
      />
    );
  }, [selectedSeal, placements, sealSize, pageSize, handleAddPlacement, handleUpdatePlacement, handleRemovePlacement]);

  // 提交盖章
  const handleSubmit = async () => {
    if (placements.length === 0) {
      alert('请先放置印章');
      return;
    }

    setSubmitting(true);
    try {
      // 按印章分组
      const sealGroups = new Map<number, SealPlacement[]>();
      placements.forEach(p => {
        const list = sealGroups.get(p.seal.id) || [];
        list.push(p);
        sealGroups.set(p.seal.id, list);
      });

      // 为每个印章创建请求
      const requests: ContractSealRequest[] = [];
      sealGroups.forEach((placementList, sealId) => {
        const positions: SealPosition[] = placementList.map(p =>
          placementToSealPosition(p, pageSize.width, pageSize.height)
        );

        requests.push({
          sealId,
          positions,
          operatorId,
          operatorName,
          sealType: 1, // 普通章
        });
      });

      // 逐个执行盖章
      for (const request of requests) {
        const response = await sealContract(contractId, request);
        if (!response.success) {
          throw new Error(response.message || '盖章失败');
        }
      }

      // 成功后清空并通知
      setPlacements([]);
      setSelectedSeal(null);
      onSealComplete?.({ success: true, message: '盖章成功' });

    } catch (error) {
      console.error('盖章失败:', error);
      onSealComplete?.({
        success: false,
        message: error instanceof Error ? error.message : '盖章失败'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 统计信息
  const placementCount = placements.length;
  const pageCount = new Set(placements.map(p => p.pageNumber)).size;

  return (
    <div className={`flex bg-gray-100 rounded-lg overflow-hidden ${height}`}>
      {/* 左侧：印章选择器 */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="px-3 py-2 border-b bg-gray-50">
          <h3 className="font-medium text-gray-700">选择印章</h3>
        </div>
        <div className="flex-1 overflow-hidden">
          <SealPicker
            value={selectedSeal}
            onChange={setSelectedSeal}
            onSizeChange={setSealSize}
            defaultSize={sealSize}
            showSizeControl
          />
        </div>
      </div>

      {/* 中间：PDF 预览 */}
      <div className="flex-1 flex flex-col">
        <PdfViewer
          contractId={contractId}
          onPageChange={setCurrentPage}
          renderOverlay={renderOverlay}
          showPageNumbers
          heightClassName="flex-1"
        />
      </div>

      {/* 右侧：操作面板 */}
      <div className="w-56 bg-white border-l flex flex-col">
        <div className="px-3 py-2 border-b bg-gray-50">
          <h3 className="font-medium text-gray-700">盖章操作</h3>
        </div>

        <div className="flex-1 p-3 space-y-4">
          {/* 统计信息 */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">当前页</span>
              <span className="font-medium">{currentPage}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">已放置印章</span>
              <span className="font-medium text-blue-600">{placementCount} 个</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">涉及页数</span>
              <span className="font-medium">{pageCount} 页</span>
            </div>
          </div>

          {/* 印章列表 */}
          {placements.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">印章位置</h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {placements.map((p, index) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded text-xs"
                  >
                    <span className="truncate flex-1">
                      {index + 1}. P{p.pageNumber} ({Math.round(p.x)}, {Math.round(p.y)})
                    </span>
                    <button
                      onClick={() => handleRemovePlacement(p.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 使用说明 */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>💡 使用说明：</p>
            <ol className="list-decimal list-inside space-y-0.5 text-gray-400">
              <li>在左侧选择印章</li>
              <li>点击PDF页面放置印章</li>
              <li>拖拽调整印章位置</li>
              <li>点击执行盖章完成</li>
            </ol>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="p-3 border-t space-y-2">
          {placements.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={submitting}
              className="w-full py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              清空所有
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={placements.length === 0 || submitting}
            className={`
              w-full py-2.5 text-sm font-medium rounded-lg transition-colors
              ${placements.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
              disabled:opacity-50
            `}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                盖章中...
              </span>
            ) : (
              `执行盖章 (${placementCount})`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
