'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import {
  type Seal,
  type SealCreateRequest,
  type SealUpdateRequest,
  SEAL_TYPES,
  OWNER_TYPES,
  uploadSealImage,
  createSeal,
  updateSeal,
} from '@/lib/seal-api';

interface SealEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  seal?: Seal | null;
}

/**
 * 印章编辑/新增弹窗
 */
export default function SealEditModal({
  isOpen,
  onClose,
  onSuccess,
  seal,
}: SealEditModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    sealName: '',
    sealType: 1,
    sealImage: '',
    sealImageUrl: '',
    ownerId: 1,
    ownerType: 1,
    ownerName: '',
    remark: '',
  });

  const isEdit = !!seal;

  // 初始化表单数据
  useEffect(() => {
    if (seal) {
      setFormData({
        sealName: seal.sealName,
        sealType: seal.sealType,
        sealImage: seal.sealImage,
        sealImageUrl: seal.sealImageUrl || '',
        ownerId: seal.ownerId,
        ownerType: seal.ownerType,
        ownerName: seal.ownerName || '',
        remark: seal.remark || '',
      });
    } else {
      setFormData({
        sealName: '',
        sealType: 1,
        sealImage: '',
        sealImageUrl: '',
        ownerId: 1,
        ownerType: 1,
        ownerName: '',
        remark: '',
      });
    }
  }, [seal, isOpen]);

  // 处理文件上传
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // 验证文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    setUploading(true);
    try {
      const response = await uploadSealImage(file);
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          sealImage: response.data.filePath,
          sealImageUrl: response.data.fileUrl,
        }));
      } else {
        alert(response.message || '上传失败');
      }
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填项
    if (!formData.sealName.trim()) {
      alert('请输入印章名称');
      return;
    }
    if (!formData.sealImage) {
      alert('请上传印章图片');
      return;
    }

    setLoading(true);
    try {
      if (isEdit && seal) {
        // 更新印章
        const updateData: SealUpdateRequest = {
          sealName: formData.sealName,
          sealType: formData.sealType,
          sealImage: formData.sealImage,
          remark: formData.remark,
        };
        const response = await updateSeal(seal.id, updateData);
        if (response.success) {
          onSuccess();
          onClose();
        } else {
          alert(response.message || '更新失败');
        }
      } else {
        // 创建印章
        const createData: SealCreateRequest = {
          sealName: formData.sealName,
          sealType: formData.sealType,
          sealImage: formData.sealImage,
          ownerId: formData.ownerId,
          ownerType: formData.ownerType,
          ownerName: formData.ownerName,
          remark: formData.remark,
        };
        const response = await createSeal(createData);
        if (response.success) {
          onSuccess();
          onClose();
        } else {
          alert(response.message || '创建失败');
        }
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '编辑印章' : '新增印章'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 印章名称 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            印章名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.sealName}
            onChange={(e) => setFormData(prev => ({ ...prev, sealName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入印章名称"
          />
        </div>

        {/* 印章类型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            印章类型 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.sealType}
            onChange={(e) => setFormData(prev => ({ ...prev, sealType: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {SEAL_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* 所有者类型和ID（仅新增时） */}
        {!isEdit && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                所有者类型
              </label>
              <select
                value={formData.ownerType}
                onChange={(e) => setFormData(prev => ({ ...prev, ownerType: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {OWNER_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                所有者名称
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="企业/个人名称"
              />
            </div>
          </div>
        )}

        {/* 印章图片 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            印章图片 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-start gap-4">
            {/* 图片预览 */}
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
              {formData.sealImageUrl ? (
                <Image
                  src={formData.sealImageUrl}
                  alt="印章预览"
                  width={120}
                  height={120}
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-gray-400 text-sm">暂无图片</span>
              )}
            </div>

            {/* 上传按钮 */}
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                {uploading ? '上传中...' : '选择图片'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                支持 PNG、JPG 格式，最大 5MB
              </p>
            </div>
          </div>
        </div>

        {/* 备注 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            备注
          </label>
          <textarea
            value={formData.remark}
            onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="请输入备注信息（可选）"
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? '保存中...' : (isEdit ? '保存修改' : '创建印章')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
