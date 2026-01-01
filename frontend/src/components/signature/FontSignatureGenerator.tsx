'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAvailableFonts, generateFontSignature, type FontInfo, type FontSignatureRequest, SIGNATURE_COLORS } from '@/lib/signature-api';

interface FontSignatureGeneratorProps {
  /** 用户ID */
  userId: number;
  /** 创建者 */
  createBy?: string;
  /** 生成成功回调 */
  onGenerated?: (signatureId: number) => void;
  /** 取消回调 */
  onCancel?: () => void;
}

/**
 * 字体签名生成器
 *
 * 功能：
 * - 从后端获取可用字体列表
 * - 输入签名文字
 * - 选择字体样式
 * - 选择字体颜色
 * - 实时预览效果
 * - 生成签名图片
 */
export default function FontSignatureGenerator({
  userId,
  createBy,
  onGenerated,
  onCancel,
}: FontSignatureGeneratorProps) {
  // 可用字体列表
  const [fonts, setFonts] = useState<FontInfo[]>([]);
  // 加载状态
  const [loading, setLoading] = useState(true);
  // 签名文字
  const [text, setText] = useState('');
  // 选中的字体
  const [selectedFont, setSelectedFont] = useState<string>('');
  // 字体颜色
  const [color, setColor] = useState('#000000');
  // 签名名称
  const [signatureName, setSignatureName] = useState('');
  // 是否设为默认
  const [setDefault, setSetDefault] = useState(false);
  // 生成状态
  const [generating, setGenerating] = useState(false);
  // 错误信息
  const [error, setError] = useState<string | null>(null);

  // 加载可用字体
  useEffect(() => {
    const loadFonts = async () => {
      try {
        setLoading(true);
        const response = await getAvailableFonts();
        if (response.success && response.data) {
          // 只显示可用的字体
          const availableFonts = response.data.filter(f => f.available);
          setFonts(availableFonts);
          // 默认选择第一个字体
          if (availableFonts.length > 0) {
            setSelectedFont(availableFonts[0].fontName);
          }
        } else {
          setError('加载字体列表失败');
        }
      } catch (err) {
        console.error('加载字体失败:', err);
        setError('加载字体列表失败');
      } finally {
        setLoading(false);
      }
    };

    loadFonts();
  }, []);

  // 生成签名
  const handleGenerate = useCallback(async () => {
    if (!text.trim()) {
      setError('请输入签名文字');
      return;
    }
    if (!selectedFont) {
      setError('请选择字体');
      return;
    }

    setError(null);
    setGenerating(true);

    try {
      const request: FontSignatureRequest = {
        userId,
        text: text.trim(),
        fontName: selectedFont,
        fontColor: color,
        signatureName: signatureName.trim() || `${text.trim()}_签名`,
        setDefault,
        createBy,
      };

      const response = await generateFontSignature(request);
      if (response.success && response.data) {
        onGenerated?.(response.data.id);
      } else {
        setError(response.message || '生成签名失败');
      }
    } catch (err) {
      console.error('生成签名失败:', err);
      setError('生成签名失败，请重试');
    } finally {
      setGenerating(false);
    }
  }, [text, selectedFont, color, signatureName, setDefault, userId, createBy, onGenerated]);

  // 预览样式
  const previewStyle = {
    fontFamily: selectedFont || 'inherit',
    color: color,
    fontSize: '48px',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-blue-600\" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gray-500">加载字体中...</span>
        </div>
      </div>
    );
  }

  if (fonts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p>暂无可用字体</p>
        <p className="text-sm mt-1">请联系管理员配置字体</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* 签名文字输入 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          签名文字 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="请输入您的姓名或签名内容"
          maxLength={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">最多 10 个字符</p>
      </div>

      {/* 字体选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          选择字体 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {fonts.map((font) => (
            <button
              key={font.fontName}
              onClick={() => setSelectedFont(font.fontName)}
              className={`
                p-3 rounded-lg border-2 text-left transition-all
                ${selectedFont === font.fontName
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <span
                className="block text-lg truncate"
                style={{ fontFamily: font.fontName }}
              >
                {font.sample || font.displayName}
              </span>
              <span className="text-xs text-gray-500 mt-1 block">
                {font.displayName}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 颜色选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          字体颜色
        </label>
        <div className="flex gap-2">
          {SIGNATURE_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              className={`
                w-8 h-8 rounded-full border-2 transition-all
                ${color === c.value ? 'border-gray-800 scale-110' : 'border-gray-300'}
              `}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* 预览区域 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          预览效果
        </label>
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-24 flex items-center justify-center">
          {text ? (
            <span style={previewStyle} className="select-none">
              {text}
            </span>
          ) : (
            <span className="text-gray-400">输入文字后显示预览</span>
          )}
        </div>
      </div>

      {/* 签名名称（可选） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          签名名称（可选）
        </label>
        <input
          type="text"
          value={signatureName}
          onChange={(e) => setSignatureName(e.target.value)}
          placeholder="为此签名起一个名字，方便识别"
          maxLength={50}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 设为默认 */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="setDefault"
          checked={setDefault}
          onChange={(e) => setSetDefault(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="setDefault" className="ml-2 text-sm text-gray-700">
          设为默认签名
        </label>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={generating}
            className="flex-1 py-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            取消
          </button>
        )}
        <button
          onClick={handleGenerate}
          disabled={generating || !text.trim() || !selectedFont}
          className={`
            flex-1 py-2.5 font-medium rounded-lg transition-colors
            ${text.trim() && selectedFont
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
            disabled:opacity-50
          `}
        >
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              生成中...
            </span>
          ) : (
            '生成签名'
          )}
        </button>
      </div>
    </div>
  );
}
