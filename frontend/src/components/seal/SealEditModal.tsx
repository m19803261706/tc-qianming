'use client';

/**
 * 印章编辑/新增弹窗 - Shadcn/UI 版本
 *
 * 功能：
 * - 新增印章：填写表单并上传/生成印章图片
 * - 编辑印章：修改现有印章信息
 */

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Upload, Wand2, Loader2, Save, X } from 'lucide-react';

// Shadcn/UI 组件
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// 业务组件
import SealGenerator from './SealGenerator';

// API 类型
import {
  type Seal,
  type SealCreateRequest,
  type SealUpdateRequest,
  type FileUploadResponse,
  SEAL_TYPES,
  OWNER_TYPES,
  uploadSealImage,
  createSeal,
  updateSeal,
} from '@/lib/seal-api';
import { getFullFileUrl } from '@/lib/api';

interface SealEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  seal?: Seal | null;
}

export default function SealEditModal({
  isOpen,
  onClose,
  onSuccess,
  seal,
}: SealEditModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [formData, setFormData] = useState({
    sealName: '',
    sealType: '1',
    sealImage: '',
    sealImageUrl: '',
    sealSource: 1,  // 印章来源: 1-上传 2-系统生成 3-模板
    ownerId: 1,
    ownerType: '1',
    ownerName: '',
    remark: '',
  });

  const isEdit = !!seal;

  // 初始化表单数据
  useEffect(() => {
    if (seal) {
      setFormData({
        sealName: seal.sealName,
        sealType: String(seal.sealType),
        sealImage: seal.sealImage,
        sealImageUrl: seal.sealImageUrl || '',
        ownerId: seal.ownerId,
        ownerType: String(seal.ownerType),
        ownerName: seal.ownerName || '',
        remark: seal.remark || '',
      });
    } else {
      setFormData({
        sealName: '',
        sealType: '1',
        sealImage: '',
        sealImageUrl: '',
        sealSource: 1,
        ownerId: 1,
        ownerType: '1',
        ownerName: '',
        remark: '',
      });
    }
  }, [seal, isOpen]);

  // 处理文件上传
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

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
          sealSource: 1,  // 上传
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

  // 处理自动生成的印章
  const handleGeneratedSeal = (result: FileUploadResponse) => {
    setFormData(prev => ({
      ...prev,
      sealImage: result.filePath,
      sealImageUrl: result.fileUrl,
      sealSource: 2,  // 系统生成
    }));
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        const updateData: SealUpdateRequest = {
          sealName: formData.sealName,
          sealType: Number(formData.sealType),
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
        const createData: SealCreateRequest = {
          sealName: formData.sealName,
          sealType: Number(formData.sealType),
          sealImage: formData.sealImage,
          sealSource: formData.sealSource,  // 印章来源
          ownerId: formData.ownerId,
          ownerType: Number(formData.ownerType),
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
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEdit ? '编辑印章' : '新增印章'}</DialogTitle>
            <DialogDescription>
              {isEdit ? '修改印章信息并保存' : '填写印章信息，上传或生成印章图片'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 印章名称 */}
            <div className="space-y-2">
              <Label htmlFor="sealName">
                印章名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sealName"
                value={formData.sealName}
                onChange={(e) => setFormData(prev => ({ ...prev, sealName: e.target.value }))}
                placeholder="请输入印章名称"
              />
            </div>

            {/* 印章类型 */}
            <div className="space-y-2">
              <Label>
                印章类型 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.sealType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, sealType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择印章类型" />
                </SelectTrigger>
                <SelectContent>
                  {SEAL_TYPES.map(type => (
                    <SelectItem key={type.value} value={String(type.value)}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 所有者信息（仅新增时） */}
            {!isEdit && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>所有者类型</Label>
                  <Select
                    value={formData.ownerType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, ownerType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OWNER_TYPES.map(type => (
                        <SelectItem key={type.value} value={String(type.value)}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">所有者名称</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                    placeholder="企业/个人名称"
                  />
                </div>
              </div>
            )}

            {/* 印章图片 */}
            <div className="space-y-2">
              <Label>
                印章图片 <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-start gap-4">
                {/* 图片预览 */}
                <div className="w-28 h-28 border-2 border-dashed border-muted rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden flex-shrink-0">
                  {formData.sealImageUrl ? (
                    <Image
                      src={getFullFileUrl(formData.sealImageUrl)}
                      alt="印章预览"
                      width={100}
                      height={100}
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <span className="text-muted-foreground text-xs">暂无图片</span>
                  )}
                </div>

                {/* 上传按钮 */}
                <div className="flex-1 space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {uploading ? '上传中...' : '上传图片'}
                    </Button>
                    {!isEdit && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowGenerator(true)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <Wand2 className="w-4 h-4" />
                        自动生成
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    支持 PNG、JPG 格式，最大 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* 备注 */}
            <div className="space-y-2">
              <Label htmlFor="remark">备注</Label>
              <Textarea
                id="remark"
                value={formData.remark}
                onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
                rows={3}
                placeholder="请输入备注信息（可选）"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                <X className="w-4 h-4" />
                取消
              </Button>
              <Button type="submit" disabled={loading || uploading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? '保存中...' : (isEdit ? '保存修改' : '创建印章')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 印章自动生成弹窗 */}
      <SealGenerator
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        onSuccess={handleGeneratedSeal}
      />
    </>
  );
}
