'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

interface SignaturePadProps {
  /** 宽度 */
  width?: number;
  /** 高度 */
  height?: number;
  /** 笔触颜色 */
  strokeColor?: string;
  /** 笔触宽度 */
  strokeWidth?: number;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 签名变化回调（返回 Base64 数据） */
  onChange?: (dataUrl: string | null) => void;
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 手写签名板组件
 *
 * 功能：
 * - Canvas 画布手写签名
 * - 支持触屏和鼠标
 * - 笔触粗细调节
 * - 颜色选择
 * - 清除/撤销
 * - 导出透明背景 PNG
 */
export default function SignaturePad({
  width = 600,
  height = 200,
  strokeColor = '#000000',
  strokeWidth = 3,
  backgroundColor = '#ffffff',
  onChange,
  showToolbar = true,
  disabled = false,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [currentColor, setCurrentColor] = useState(strokeColor);
  const [currentWidth, setCurrentWidth] = useState(strokeWidth);
  const [isEmpty, setIsEmpty] = useState(true);
  const [history, setHistory] = useState<ImageData[]>([]);

  // 预设颜色
  const colors = [
    { name: '黑色', value: '#000000' },
    { name: '蓝色', value: '#1E40AF' },
    { name: '红色', value: '#DC2626' },
  ];

  // 预设笔触宽度
  const widths = [
    { name: '细', value: 2 },
    { name: '中', value: 3 },
    { name: '粗', value: 5 },
  ];

  // 初始化 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置高清画布
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // 设置白色背景（用于显示）
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // 保存初始状态
    const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialState]);
  }, [width, height, backgroundColor]);

  // 获取鼠标/触摸点坐标
  const getPoint = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  }, []);

  // 开始绘制
  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;

    e.preventDefault();
    const point = getPoint(e);
    setIsDrawing(true);
    setLastPoint(point);
    setIsEmpty(false);

    // 画一个点（用于单击）
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, currentWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = currentColor;
      ctx.fill();
    }
  }, [disabled, getPoint, currentColor, currentWidth]);

  // 绘制中
  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;

    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !lastPoint) return;

    const currentPoint = getPoint(e);

    // 绘制线条
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    setLastPoint(currentPoint);
  }, [isDrawing, disabled, lastPoint, getPoint, currentColor, currentWidth]);

  // 通知变化（导出透明背景图片）
  const notifyChange = useCallback(() => {
    if (!onChange) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // 创建临时画布，只保留签名部分（透明背景）
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // 获取原始数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 将白色背景转换为透明
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // 如果是白色或接近白色，设为透明
      if (r > 250 && g > 250 && b > 250) {
        data[i + 3] = 0; // 设置 alpha 为 0（透明）
      }
    }

    tempCtx.putImageData(imageData, 0, 0);
    const dataUrl = tempCanvas.toDataURL('image/png');
    onChange(dataUrl);
  }, [onChange]);

  // 结束绘制
  const endDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setLastPoint(null);

      // 保存历史记录
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory(prev => [...prev, state]);
      }

      // 通知变化
      notifyChange();
    }
  }, [isDrawing, notifyChange]);

  // 清除画布
  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width * dpr, height * dpr);
    setIsEmpty(true);
    setHistory([]);
    onChange?.(null);
  }, [width, height, backgroundColor, onChange]);

  // 撤销
  const undo = useCallback(() => {
    if (history.length <= 1) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const newHistory = history.slice(0, -1);
    const prevState = newHistory[newHistory.length - 1];

    if (prevState) {
      ctx.putImageData(prevState, 0, 0);
      setHistory(newHistory);
      notifyChange();
    }

    if (newHistory.length <= 1) {
      setIsEmpty(true);
    }
  }, [history, notifyChange]);

  // 获取签名数据（供外部调用）
  const getSignatureData = useCallback((): string | null => {
    if (isEmpty) return null;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return null;

    // 创建透明背景图片
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return null;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (r > 250 && g > 250 && b > 250) {
        data[i + 3] = 0;
      }
    }

    tempCtx.putImageData(imageData, 0, 0);
    return tempCanvas.toDataURL('image/png');
  }, [isEmpty]);

  // 暴露方法给父组件
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      (canvas as unknown as { getSignatureData: () => string | null }).getSignatureData = getSignatureData;
      (canvas as unknown as { clear: () => void }).clear = clear;
    }
  }, [getSignatureData, clear]);

  return (
    <div className="flex flex-col">
      {/* 工具栏 */}
      {showToolbar && (
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-t-lg">
          {/* 颜色选择 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">颜色:</span>
            <div className="flex gap-1">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setCurrentColor(color.value)}
                  disabled={disabled}
                  className={`
                    w-6 h-6 rounded-full border-2 transition-all
                    ${currentColor === color.value ? 'border-gray-800 scale-110' : 'border-gray-300'}
                    disabled:opacity-50
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* 笔触宽度 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">粗细:</span>
            <div className="flex gap-1">
              {widths.map((w) => (
                <button
                  key={w.value}
                  onClick={() => setCurrentWidth(w.value)}
                  disabled={disabled}
                  className={`
                    px-2 py-0.5 text-xs rounded transition-all
                    ${currentWidth === w.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }
                    disabled:opacity-50
                  `}
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={disabled || history.length <= 1}
              className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
              title="撤销"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={clear}
              disabled={disabled || isEmpty}
              className="px-2 py-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              title="清除"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 画布区域 */}
      <div
        className={`
          relative border-2 border-dashed border-gray-300 bg-white overflow-hidden
          ${showToolbar ? 'rounded-b-lg border-t-0' : 'rounded-lg'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-crosshair'}
        `}
        style={{ width, height }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="touch-none"
        />

        {/* 提示文字 */}
        {isEmpty && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-400 text-sm">请在此处签名</span>
          </div>
        )}
      </div>

      {/* 状态提示 */}
      {!isEmpty && (
        <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          签名已保存
        </div>
      )}
    </div>
  );
}
