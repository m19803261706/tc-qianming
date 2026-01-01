'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { type ContractPreview, previewContract } from '@/lib/contract-api';
import { getFullFileUrl } from '@/lib/api';

interface PdfViewerProps {
  /** 合同ID */
  contractId: number;
  /** 当前页码变化回调 */
  onPageChange?: (page: number) => void;
  /** 点击页面回调（返回点击坐标，相对于页面左上角） */
  onPageClick?: (page: number, x: number, y: number, pageWidth: number, pageHeight: number) => void;
  /** 缩放比例 */
  scale?: number;
  /** 是否显示页码 */
  showPageNumbers?: boolean;
  /** 叠加层渲染函数（用于渲染印章等元素） */
  renderOverlay?: (page: number, pageWidth: number, pageHeight: number) => React.ReactNode;
  /** 高度类名 */
  heightClassName?: string;
}

/**
 * PDF 预览器组件
 *
 * 功能：
 * - PDF 分页预览
 * - 页码切换
 * - 缩放功能
 * - 点击获取坐标
 * - 叠加层渲染
 */
export default function PdfViewer({
  contractId,
  onPageChange,
  onPageClick,
  scale = 1,
  showPageNumbers = true,
  renderOverlay,
  heightClassName = 'h-[600px]',
}: PdfViewerProps) {
  const [preview, setPreview] = useState<ContractPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentScale, setCurrentScale] = useState(scale);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // 加载预览数据
  useEffect(() => {
    const loadPreview = async () => {
      setLoading(true);
      try {
        const response = await previewContract(contractId);
        if (response.success) {
          setPreview(response.data);
        } else {
          console.error('加载预览失败:', response.message);
        }
      } catch (error) {
        console.error('加载预览失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      loadPreview();
    }
  }, [contractId]);

  // 页码变化通知
  useEffect(() => {
    onPageChange?.(currentPage);
  }, [currentPage, onPageChange]);

  // 跳转到指定页
  const goToPage = useCallback((page: number) => {
    if (!preview) return;
    const targetPage = Math.max(1, Math.min(page, preview.totalPages));
    setCurrentPage(targetPage);

    // 滚动到对应页面
    const pageElement = pageRefs.current.get(targetPage);
    if (pageElement && containerRef.current) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [preview]);

  // 处理页面点击
  const handlePageClick = useCallback((
    e: React.MouseEvent<HTMLDivElement>,
    pageNumber: number
  ) => {
    if (!onPageClick) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / currentScale;
    const y = (e.clientY - rect.top) / currentScale;
    const pageWidth = rect.width / currentScale;
    const pageHeight = rect.height / currentScale;

    onPageClick(pageNumber, x, y, pageWidth, pageHeight);
  }, [onPageClick, currentScale]);

  // 缩放控制
  const zoomIn = () => setCurrentScale(s => Math.min(s + 0.25, 3));
  const zoomOut = () => setCurrentScale(s => Math.max(s - 0.25, 0.5));
  const resetZoom = () => setCurrentScale(1);

  // 监听滚动更新当前页
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let closestPage = 1;
      let closestDistance = Infinity;

      pageRefs.current.forEach((element, page) => {
        const rect = element.getBoundingClientRect();
        const pageCenter = rect.top + rect.height / 2;
        const distance = Math.abs(pageCenter - containerCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestPage = page;
        }
      });

      if (closestPage !== currentPage) {
        setCurrentPage(closestPage);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${heightClassName}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-500">加载预览中...</p>
        </div>
      </div>
    );
  }

  if (!preview || preview.previewUrls.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${heightClassName}`}>
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>暂无预览</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b rounded-t-lg">
        {/* 页码导航 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="上一页"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={preview.totalPages}
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
              className="w-12 px-2 py-1 text-center text-sm border rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">/ {preview.totalPages}</span>
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= preview.totalPages}
            className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="下一页"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 缩放控制 */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={currentScale <= 0.5}
            className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50"
            title="缩小"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          <button
            onClick={resetZoom}
            className="px-2 py-1 text-sm font-medium rounded hover:bg-gray-200"
            title="重置缩放"
          >
            {Math.round(currentScale * 100)}%
          </button>

          <button
            onClick={zoomIn}
            disabled={currentScale >= 3}
            className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50"
            title="放大"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* 文件信息 */}
        <div className="text-sm text-gray-500">
          {preview.fileName}
        </div>
      </div>

      {/* PDF 预览区域 */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-auto bg-gray-200 ${heightClassName}`}
      >
        <div className="flex flex-col items-center py-4 space-y-4">
          {preview.previewUrls.map((url, index) => {
            const pageNumber = index + 1;
            return (
              <div
                key={pageNumber}
                ref={(el) => {
                  if (el) pageRefs.current.set(pageNumber, el);
                }}
                className="relative bg-white shadow-lg"
                style={{
                  transform: `scale(${currentScale})`,
                  transformOrigin: 'top center',
                  marginBottom: currentScale > 1 ? `${(currentScale - 1) * (preview.height || 800)}px` : 0,
                }}
              >
                {/* 页面图片 */}
                <div
                  onClick={(e) => handlePageClick(e, pageNumber)}
                  className={onPageClick ? 'cursor-crosshair' : ''}
                >
                  <Image
                    src={getFullFileUrl(url)}
                    alt={`第 ${pageNumber} 页`}
                    width={preview.width || 600}
                    height={preview.height || 800}
                    className="block"
                    unoptimized
                    priority={pageNumber <= 2}
                  />
                </div>

                {/* 叠加层（用于渲染印章等） */}
                {renderOverlay && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ pointerEvents: 'none' }}
                  >
                    {renderOverlay(pageNumber, preview.width || 600, preview.height || 800)}
                  </div>
                )}

                {/* 页码标签 */}
                {showPageNumbers && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-xs rounded-full">
                    {pageNumber} / {preview.totalPages}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
