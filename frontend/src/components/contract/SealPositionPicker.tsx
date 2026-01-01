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
}: SealPositionPickerProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // 过滤当前页的印章
  const currentPagePlacements = placements.filter(p => p.pageNumber === pageNumber);

  // 生成唯一ID
  const generateId = () => `seal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // 处理点击添加印章
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedSeal || draggingId) return;

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
  }, [selectedSeal, draggingId, pageNumber, pageWidth, pageHeight, defaultSealSize, onAddPlacement]);

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

  // 监听全局鼠标事件
  useEffect(() => {
    if (draggingId) {
      const handleMouseUp = () => handleDragEnd();
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [draggingId, handleDragEnd]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 ${selectedSeal ? 'cursor-crosshair' : ''}`}
      style={{ pointerEvents: 'auto' }}
      onClick={handleClick}
      onMouseMove={draggingId ? handleDragMove : undefined}
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

          {/* 坐标信息（悬停显示） */}
          <div className="absolute -bottom-6 left-0 text-xs text-gray-600 bg-white/80 px-1 rounded
                          opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            ({Math.round(placement.x)}, {Math.round(placement.y)})
          </div>
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
