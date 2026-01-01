'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { type Seal } from '@/lib/seal-api';
import { type SealPosition } from '@/lib/contract-api';
import { getFullFileUrl } from '@/lib/api';

/**
 * 印章放置信息（前端使用，包含更多UI信息）
 */
export interface SealPlacement {
  id: string; // 唯一标识
  seal: Seal; // 印章信息
  pageNumber: number;
  x: number; // 相对于页面的X坐标（像素）
  y: number; // 相对于页面的Y坐标（像素）
  width: number;
  height: number;
}

/**
 * 缩放手柄位置类型
 */
type ResizeHandle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface SealPositionPickerProps {
  /** 页码 */
  pageNumber: number;
  /** 页面宽度 */
  pageWidth: number;
  /** 页面高度 */
  pageHeight: number;
  /** 当前选中的印章 */
  selectedSeal: Seal | null;
  /** 已放置的印章列表 */
  placements: SealPlacement[];
  /** 添加印章回调 */
  onAddPlacement: (placement: SealPlacement) => void;
  /** 更新印章位置回调 */
  onUpdatePlacement: (id: string, updates: Partial<SealPlacement>) => void;
  /** 删除印章回调 */
  onRemovePlacement: (id: string) => void;
  /** 印章默认尺寸 */
  defaultSealSize?: number;
  /** 印章最小尺寸 */
  minSealSize?: number;
  /** 印章最大尺寸 */
  maxSealSize?: number;
}

/**
 * 盖章位置选择器组件
 *
 * 功能：
 * - 点击放置印章
 * - 拖拽调整位置
 * - 删除已放置印章
 * - 显示坐标信息
 */
export default function SealPositionPicker({
  pageNumber,
  pageWidth,
  pageHeight,
  selectedSeal,
  placements,
  onAddPlacement,
  onUpdatePlacement,
  onRemovePlacement,
  defaultSealSize = 80,
  minSealSize = 30,
  maxSealSize = 200,
}: SealPositionPickerProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // 缩放状态
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, originX: 0, originY: 0 });

  // 过滤当前页的印章
  const currentPagePlacements = placements.filter(p => p.pageNumber === pageNumber);

  // 生成唯一ID
  const generateId = () => `seal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // 处理点击添加印章
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // 如果正在拖拽或缩放，不添加新印章
    if (!selectedSeal || draggingId || resizingId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - defaultSealSize / 2;
    const y = e.clientY - rect.top - defaultSealSize / 2;

    // 边界检查
    const boundedX = Math.max(0, Math.min(x, pageWidth - defaultSealSize));
    const boundedY = Math.max(0, Math.min(y, pageHeight - defaultSealSize));

    const placement: SealPlacement = {
      id: generateId(),
      seal: selectedSeal,
      pageNumber,
      x: boundedX,
      y: boundedY,
      width: defaultSealSize,
      height: defaultSealSize,
    };

    onAddPlacement(placement);
  }, [selectedSeal, draggingId, resizingId, pageNumber, pageWidth, pageHeight, defaultSealSize, onAddPlacement]);

  // 开始拖拽
  const handleDragStart = useCallback((e: React.MouseEvent, placement: SealPlacement) => {
    e.stopPropagation();
    setDraggingId(placement.id);

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  // 拖拽移动
  const handleDragMove = useCallback((e: React.MouseEvent) => {
    if (!draggingId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const placement = placements.find(p => p.id === draggingId);
    if (!placement) return;

    let x = e.clientX - rect.left - dragOffset.x;
    let y = e.clientY - rect.top - dragOffset.y;

    // 边界检查
    x = Math.max(0, Math.min(x, pageWidth - placement.width));
    y = Math.max(0, Math.min(y, pageHeight - placement.height));

    onUpdatePlacement(draggingId, { x, y });
  }, [draggingId, dragOffset, pageWidth, pageHeight, placements, onUpdatePlacement]);

  // 结束拖拽
  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
  }, []);

  // 删除印章
  const handleRemove = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onRemovePlacement(id);
  }, [onRemovePlacement]);

  // 开始缩放
  const handleResizeStart = useCallback((e: React.MouseEvent, placement: SealPlacement, handle: ResizeHandle) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingId(placement.id);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: placement.width,
      height: placement.height,
      originX: placement.x,
      originY: placement.y,
    });
  }, []);

  // 缩放移动
  const handleResizeMove = useCallback((e: React.MouseEvent) => {
    if (!resizingId || !resizeHandle) return;

    const placement = placements.find(p => p.id === resizingId);
    if (!placement) return;

    // 计算鼠标移动距离
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    // 根据手柄位置计算新尺寸（保持 1:1 比例）
    let newSize = resizeStart.width;
    let newX = resizeStart.originX;
    let newY = resizeStart.originY;

    // 使用较大的变化量来确定缩放方向
    const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;

    switch (resizeHandle) {
      case 'bottom-right':
        // 右下角：增大delta = 放大
        newSize = resizeStart.width + delta;
        break;
      case 'top-left':
        // 左上角：减小delta = 放大
        newSize = resizeStart.width - delta;
        newX = resizeStart.originX + (resizeStart.width - newSize);
        newY = resizeStart.originY + (resizeStart.height - newSize);
        break;
      case 'top-right':
        // 右上角：X增大=放大, Y减小=放大
        newSize = resizeStart.width + deltaX;
        newY = resizeStart.originY + (resizeStart.height - newSize);
        break;
      case 'bottom-left':
        // 左下角：X减小=放大, Y增大=放大
        newSize = resizeStart.width - deltaX;
        newX = resizeStart.originX + (resizeStart.width - newSize);
        break;
    }

    // 限制尺寸范围
    newSize = Math.max(minSealSize, Math.min(maxSealSize, newSize));

    // 重新计算位置以适应尺寸限制
    if (resizeHandle === 'top-left' || resizeHandle === 'bottom-left') {
      newX = resizeStart.originX + (resizeStart.width - newSize);
    }
    if (resizeHandle === 'top-left' || resizeHandle === 'top-right') {
      newY = resizeStart.originY + (resizeStart.height - newSize);
    }

    // 边界检查
    newX = Math.max(0, Math.min(newX, pageWidth - newSize));
    newY = Math.max(0, Math.min(newY, pageHeight - newSize));

    onUpdatePlacement(resizingId, {
      x: newX,
      y: newY,
      width: newSize,
      height: newSize,
    });
  }, [resizingId, resizeHandle, resizeStart, placements, minSealSize, maxSealSize, pageWidth, pageHeight, onUpdatePlacement]);

  // 结束缩放
  const handleResizeEnd = useCallback(() => {
    setResizingId(null);
    setResizeHandle(null);
  }, []);

  // 监听全局鼠标事件（拖拽）
  useEffect(() => {
    if (draggingId) {
      const handleMouseUp = () => handleDragEnd();
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [draggingId, handleDragEnd]);

  // 监听全局鼠标事件（缩放）
  useEffect(() => {
    if (resizingId) {
      const handleMouseUp = () => handleResizeEnd();
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [resizingId, handleResizeEnd]);

  // 合并鼠标移动处理
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingId) {
      handleDragMove(e);
    } else if (resizingId) {
      handleResizeMove(e);
    }
  }, [draggingId, resizingId, handleDragMove, handleResizeMove]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 ${selectedSeal && !resizingId ? 'cursor-crosshair' : ''}`}
      style={{ pointerEvents: 'auto' }}
      onClick={resizingId ? undefined : handleClick}
      onMouseMove={(draggingId || resizingId) ? handleMouseMove : undefined}
    >
      {/* 已放置的印章 */}
      {currentPagePlacements.map((placement) => (
        <div
          key={placement.id}
          className={`
            absolute group
            ${draggingId === placement.id ? 'cursor-grabbing z-50' : 'cursor-grab'}
          `}
          style={{
            left: placement.x,
            top: placement.y,
            width: placement.width,
            height: placement.height,
          }}
          onMouseDown={(e) => handleDragStart(e, placement)}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 印章图片 */}
          <Image
            src={getFullFileUrl(placement.seal.sealImageUrl)}
            alt={placement.seal.sealName}
            width={placement.width}
            height={placement.height}
            className="w-full h-full object-contain select-none pointer-events-none"
            draggable={false}
            unoptimized
          />

          {/* 选中边框 */}
          <div className={`
            absolute inset-0 border-2 rounded
            ${draggingId === placement.id ? 'border-blue-500' : 'border-transparent group-hover:border-blue-400'}
          `} />

          {/* 删除按钮 */}
          <button
            onClick={(e) => handleRemove(e, placement.id)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full
                       opacity-0 group-hover:opacity-100 transition-opacity
                       flex items-center justify-center text-xs hover:bg-red-600"
            title="删除印章"
          >
            ×
          </button>

          {/* 坐标和尺寸信息（悬停显示） */}
          <div className="absolute -bottom-6 left-0 text-xs text-gray-600 bg-white/80 px-1 rounded
                          opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            ({Math.round(placement.x)}, {Math.round(placement.y)}) {Math.round(placement.width)}px
          </div>

          {/* 四角缩放手柄 */}
          {/* 左上角 */}
          <div
            onMouseDown={(e) => handleResizeStart(e, placement, 'top-left')}
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize
                       opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 hover:scale-125"
            title="拖拽缩放"
          />
          {/* 右上角 */}
          <div
            onMouseDown={(e) => handleResizeStart(e, placement, 'top-right')}
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize
                       opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 hover:scale-125"
            title="拖拽缩放"
          />
          {/* 左下角 */}
          <div
            onMouseDown={(e) => handleResizeStart(e, placement, 'bottom-left')}
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize
                       opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 hover:scale-125"
            title="拖拽缩放"
          />
          {/* 右下角 */}
          <div
            onMouseDown={(e) => handleResizeStart(e, placement, 'bottom-right')}
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize
                       opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 hover:scale-125"
            title="拖拽缩放"
          />
        </div>
      ))}

      {/* 选中印章时的提示 */}
      {selectedSeal && currentPagePlacements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/30 text-white px-4 py-2 rounded-lg text-sm">
            点击页面放置印章
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 将前端放置信息转换为API请求格式
 *
 * @param placement 前端放置信息
 * @param pageWidth 页面宽度（像素）
 * @param pageHeight 页面高度（像素）
 * @param pdfWidth PDF实际宽度（pt）
 * @param pdfHeight PDF实际高度（pt）
 */
export function placementToSealPosition(
  placement: SealPlacement,
  pageWidth: number,
  pageHeight: number,
  pdfWidth: number = 595, // A4默认宽度 pt
  pdfHeight: number = 842, // A4默认高度 pt
): SealPosition {
  // 计算缩放比例
  const scaleX = pdfWidth / pageWidth;
  const scaleY = pdfHeight / pageHeight;

  // 转换坐标（注意：PDF坐标系Y轴从下往上）
  const pdfX = placement.x * scaleX;
  const pdfY = pdfHeight - (placement.y + placement.height) * scaleY;

  return {
    pageNumber: placement.pageNumber,
    x: Math.round(pdfX * 100) / 100,
    y: Math.round(pdfY * 100) / 100,
    width: Math.round(placement.width * scaleX * 100) / 100,
    height: Math.round(placement.height * scaleY * 100) / 100,
  };
}
