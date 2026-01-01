'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  saveHandwriteSignature,
  generateFontSignature,
  getAvailableFonts,
  previewFontSignature,
  type FontInfo,
} from '@/lib/signature-api';

/**
 * 签名创建模式
 */
type CreateMode = 'handwrite' | 'font' | 'upload';

/**
 * 签名创建页面
 * 支持手写签名、字体生成、图片上传三种方式
 */
export default function CreateSignaturePage() {
  const router = useRouter();

  // 当前创建模式
  const [mode, setMode] = useState<CreateMode>('handwrite');
  // 签名名称
  const [signatureName, setSignatureName] = useState('');
  // 提交状态
  const [submitting, setSubmitting] = useState(false);
  // 错误信息
  const [error, setError] = useState<string | null>(null);

  // ==================== 手写签名状态 ====================
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // ==================== 字体签名状态 ====================
  const [fonts, setFonts] = useState<FontInfo[]>([]);
  const [selectedFont, setSelectedFont] = useState('');
  const [fontText, setFontText] = useState('');
  const [fontColor, setFontColor] = useState('#000000');
  const [fontsLoading, setFontsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // ==================== 上传签名状态 ====================
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 加载可用字体列表
   */
  const loadFonts = useCallback(async () => {
    try {
      setFontsLoading(true);
      const response = await getAvailableFonts();
      if (response.code === 200 && response.data) {
        setFonts(response.data);
        if (response.data.length > 0) {
          setSelectedFont(response.data[0].fontName);
        }
      }
    } catch (err) {
      console.error('加载字体列表失败:', err);
    } finally {
      setFontsLoading(false);
    }
  }, []);

  // 切换到字体模式时加载字体列表
  useEffect(() => {
    if (mode === 'font' && fonts.length === 0) {
      loadFonts();
    }
  }, [mode, fonts.length, loadFonts]);

  /**
   * 加载字体预览图片
   */
  const loadPreview = useCallback(async () => {
    if (!fontText.trim() || !selectedFont) {
      setPreviewImage(null);
      return;
    }

    try {
      setPreviewLoading(true);
      const response = await previewFontSignature(fontText.trim(), selectedFont, fontColor);
      if (response.code === 200 && response.data) {
        setPreviewImage(response.data);
      }
    } catch (err) {
      console.error('加载预览失败:', err);
    } finally {
      setPreviewLoading(false);
    }
  }, [fontText, selectedFont, fontColor]);

  // 当文字、字体或颜色变化时更新预览（防抖）
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPreview();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadPreview]);

  // ==================== Canvas 手写签名逻辑 ====================

  /**
   * 初始化 Canvas
   */
  useEffect(() => {
    if (mode === 'handwrite' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [mode]);

  /**
   * 获取鼠标/触摸位置
   */
  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  /**
   * 开始绘制
   */
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const pos = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  /**
   * 绘制中
   */
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  /**
   * 结束绘制
   */
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  /**
   * 清除画布
   */
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // ==================== 文件上传逻辑 ====================

  /**
   * 处理文件选择
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    // 验证文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过 5MB');
      return;
    }

    // 读取文件为 Base64
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  /**
   * 清除上传的图片
   */
  const clearUpload = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ==================== 提交逻辑 ====================

  /**
   * 提交签名
   */
  const handleSubmit = async () => {
    setError(null);

    // 验证签名名称
    const name = signatureName.trim() || generateDefaultName();

    try {
      setSubmitting(true);

      if (mode === 'handwrite') {
        // 手写签名
        if (!hasDrawn) {
          setError('请先绘制您的签名');
          return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const imageData = canvas.toDataURL('image/png');
        const response = await saveHandwriteSignature({
          userId: 1, // TODO: 从用户上下文获取
          imageData: imageData,
          signatureName: name,
        });

        if (response.code === 200) {
          router.push('/signatures');
        } else {
          setError(response.message || '保存签名失败');
        }
      } else if (mode === 'font') {
        // 字体签名
        if (!fontText.trim()) {
          setError('请输入签名文字');
          return;
        }

        if (!selectedFont) {
          setError('请选择字体');
          return;
        }

        const response = await generateFontSignature({
          userId: 1, // TODO: 从用户上下文获取
          text: fontText.trim(),
          fontName: selectedFont,
          fontColor: fontColor,
          signatureName: name,
        });

        if (response.code === 200) {
          router.push('/signatures');
        } else {
          setError(response.message || '生成签名失败');
        }
      } else if (mode === 'upload') {
        // 上传签名（暂未实现后端接口）
        if (!uploadedImage) {
          setError('请先上传签名图片');
          return;
        }

        // TODO: 调用上传接口
        setError('图片上传功能暂未实现');
      }
    } catch (err) {
      console.error('提交签名失败:', err);
      setError('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 生成默认签名名称
   */
  const generateDefaultName = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN').replace(/\//g, '-');
    const typeMap: Record<CreateMode, string> = {
      handwrite: '手写签名',
      font: '字体签名',
      upload: '上传签名',
    };
    return `${typeMap[mode]}_${dateStr}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">创建签名</h1>
          </div>
        </div>

        {/* 模式切换 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('handwrite')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                mode === 'handwrite'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✍️ 手写签名
            </button>
            <button
              onClick={() => setMode('font')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                mode === 'font'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔤 字体生成
            </button>
            <button
              onClick={() => setMode('upload')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                mode === 'upload'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📤 上传图片
            </button>
          </div>
        </div>

        {/* 签名名称输入 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            签名名称（可选）
          </label>
          <input
            type="text"
            value={signatureName}
            onChange={(e) => setSignatureName(e.target.value)}
            placeholder="留空将自动生成名称"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 手写签名区域 */}
        {mode === 'handwrite' && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-700">
                请在下方区域绘制您的签名
              </span>
              <button
                onClick={clearCanvas}
                className="text-sm text-red-600 hover:text-red-800"
              >
                清除
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full touch-none cursor-crosshair"
                style={{ backgroundColor: '#fff' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              提示：使用鼠标或触摸屏绘制签名
            </p>
          </div>
        )}

        {/* 字体生成区域 */}
        {mode === 'font' && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 space-y-4">
            {/* 签名文字输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                签名文字
              </label>
              <input
                type="text"
                value={fontText}
                onChange={(e) => setFontText(e.target.value)}
                placeholder="请输入您的姓名"
                maxLength={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 字体选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择字体
              </label>
              {fontsLoading ? (
                <div className="text-gray-500">加载字体中...</div>
              ) : fonts.length === 0 ? (
                <div className="text-gray-500">暂无可用字体</div>
              ) : (
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {fonts.map((font) => (
                    <option key={font.fontName} value={font.fontName}>
                      {font.displayName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 颜色选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                签名颜色
              </label>
              <div className="flex gap-2">
                {['#000000', '#1a56db', '#dc2626', '#059669'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setFontColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-transform ${
                      fontColor === color ? 'border-blue-500 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* 预览区域 */}
            {fontText && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  预览效果
                </label>
                <div
                  className="border border-gray-300 rounded-lg p-4 bg-white flex items-center justify-center"
                  style={{ minHeight: '100px' }}
                >
                  {previewLoading ? (
                    <div className="text-gray-400">加载预览中...</div>
                  ) : previewImage ? (
                    <img
                      src={previewImage}
                      alt="签名预览"
                      className="max-h-24"
                    />
                  ) : (
                    <span className="text-gray-400">输入文字后将显示预览</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 上传图片区域 */}
        {mode === 'upload' && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {uploadedImage ? (
              <div className="space-y-4">
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <img
                    src={uploadedImage}
                    alt="上传的签名"
                    className="max-h-48 mx-auto"
                  />
                </div>
                <button
                  onClick={clearUpload}
                  className="w-full py-2 text-red-600 hover:text-red-800"
                >
                  删除并重新上传
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">📤</div>
                  <div className="text-gray-600">点击上传签名图片</div>
                  <div className="text-xs text-gray-400 mt-1">
                    支持 JPG、PNG 格式，最大 5MB
                  </div>
                </div>
              </button>
            )}
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '保存中...' : '保存签名'}
          </button>
        </div>
      </div>
    </div>
  );
}
