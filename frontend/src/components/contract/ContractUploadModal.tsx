'use client';

import { useState, useRef, useCallback } from 'react';
import { uploadContract } from '@/lib/contract-api';

interface ContractUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** 默认所有者ID */
  defaultOwnerId?: number;
}

/**
 * 合同上传弹窗
 *
 * 功能：
 * - 拖拽上传 PDF
 * - 文件选择器
 * - 上传进度显示
 * - 备注输入
 */
export default function ContractUploadModal({
  isOpen,
  onClose,
  onSuccess,
  defaultOwnerId = 1,
}: ContractUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [remark, setRemark] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 重置状态
  const reset = useCallback(() => {
    setFile(null);
    setRemark('');
    setError(null);
    setUploading(false);
  }, []);

  // 关闭弹窗
  const handleClose = () => {
    if (!uploading) {
      reset();
      onClose();
    }
  };

  // 验证文件
  const validateFile = (f: File): string | null => {
    // 检查文件类型
    if (f.type !== 'application/pdf') {
      return '请上传 PDF 格式的文件';
    }
    // 检查文件大小（最大 50MB）
    const maxSize = 50 * 1024 * 1024;
    if (f.size > maxSize) {
      return '文件大小不能超过 50MB';
    }
    return null;
  };

  // 处理文件选择
  const handleFileSelect = (f: File) => {
    const err = validateFile(f);
    if (err) {
      setError(err);
      return;
    }
    setFile(f);
    setError(null);
  };

  // 文件输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // 拖拽事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // 上传文件
  const handleUpload = async () => {
    if (!file) {
      setError('请选择要上传的文件');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await uploadContract(file, defaultOwnerId, 1, remark || undefined);

      if (response.success) {
        reset();
        onSuccess();
        onClose();
      } else {
        setError(response.message || '上传失败');
      }
    } catch (err) {
      console.error('上传失败:', err);
      setError('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 遮罩 */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />

      {/* 弹窗内容 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl">
          {/* 标题栏 */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">上传合同</h3>
            <button
              onClick={handleClose}
              disabled={uploading}
              className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 内容区 */}
          <div className="px-6 py-4 space-y-4">
            {/* 拖拽上传区域 */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : file
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleInputChange}
                className="hidden"
              />

              {file ? (
                <div className="space-y-2">
                  <div className="w-16 h-16 mx-auto bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                    </svg>
                  </div>
                  <div className="text-sm font-medium text-gray-900 truncate px-4">
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    重新选择
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="text-sm text-gray-600">
                    <span className="text-blue-600 font-medium">点击上传</span>
                    <span> 或拖拽文件到此处</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    仅支持 PDF 格式，最大 50MB
                  </p>
                </div>
              )}
            </div>

            {/* 备注输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                备注（可选）
              </label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="输入合同备注信息..."
                rows={2}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="flex gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
            <button
              onClick={handleClose}
              disabled={uploading}
              className="flex-1 py-2.5 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`
                flex-1 py-2.5 font-medium rounded-lg transition-colors
                ${file
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }
                disabled:opacity-50
              `}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  上传中...
                </span>
              ) : (
                '上传'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
